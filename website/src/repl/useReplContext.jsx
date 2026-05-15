/*
Repl.jsx - <short description TODO>
Copyright (C) 2022 Strudel contributors - see <https://codeberg.org/uzu/strudel/src/branch/main/repl/src/App.js>
This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details. You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { code2hash, getPerformanceTimeSeconds, logger, silence } from '@strudel/core';
import { getDrawContext } from '@strudel/draw';
import { transpiler, evaluate } from '@strudel/transpiler';
import {
  getAudioContextCurrentTime,
  renderPatternAudio,
  webaudioOutput,
  resetGlobalEffects,
  resetLoadedSounds,
  initAudioOnFirstClick,
  resetDefaults,
  initAudio,
  getAnalyserById,
  getSuperdoughAudioController,
} from '@strudel/webaudio';
import { setVersionDefaultsFrom } from './util.mjs';
import { StrudelMirror, defaultSettings } from '@strudel/codemirror';
import { clearHydra } from '@strudel/hydra';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { parseBoolean, settingsMap, useSettings } from '../settings.mjs';
import {
  setActivePattern,
  setLatestCode,
  createPatternID,
  userPattern,
  getViewingPatternData,
  setViewingPatternData,
  useViewingPatternData,
} from '../user_pattern_utils.mjs';
import { superdirtOutput } from '@strudel/osc/superdirtoutput';
import { audioEngineTargets } from '../settings.mjs';
import { useStore } from '@nanostores/react';
import { prebake } from './prebake.mjs';
import { getRandomTune, initCode, loadModules, shareCode } from './util.mjs';
import './Repl.css';
import { setInterval, clearInterval } from 'worker-timers';
import { getMetadata } from '../metadata_parser';
import { debugAudiograph } from './audiograph';
import { exportToKals } from './export_utils.mjs';
import { recordingsDB } from '../db.mjs';

const { latestCode, maxPolyphony, audioDeviceName, multiChannelOrbits } = settingsMap.get();
let modulesLoading, presets, drawContext, clearCanvas, audioReady;

if (typeof window !== 'undefined') {
  audioReady = initAudioOnFirstClick({
    maxPolyphony,
    audioDeviceName,
    multiChannelOrbits: parseBoolean(multiChannelOrbits),
  });
  modulesLoading = loadModules();
  presets = prebake();
  drawContext = getDrawContext();
  clearCanvas = () => drawContext.clearRect(0, 0, drawContext.canvas.height, drawContext.canvas.width);
}

async function getModule(name) {
  if (!modulesLoading) {
    return;
  }
  const modules = await modulesLoading;
  return modules.find((m) => m.packageName === name);
}

const initialCode = `// LOADING`;

function computeDiff(oldCode, newCode) {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  let diff = '';
  
  // Very basic diff implementation
  const maxLines = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLines; i++) {
    if (oldLines[i] !== newLines[i]) {
      if (oldLines[i] !== undefined) diff += `- ${oldLines[i]}\n`;
      if (newLines[i] !== undefined) diff += `+ ${newLines[i]}\n`;
    } else if (oldLines[i] !== undefined) {
      // diff += `  ${oldLines[i]}\n`; // Context line (too much noise?)
    }
  }
  return diff || '// no changes';
}

export function useReplContext() {
  const { isSyncEnabled, audioEngineTarget, prebakeScript, includePrebakeScriptInShare } = useSettings();
  const shouldUseWebaudio = audioEngineTarget !== audioEngineTargets.osc;
  const defaultOutput = shouldUseWebaudio ? webaudioOutput : superdirtOutput;
  const getTime = shouldUseWebaudio ? getAudioContextCurrentTime : getPerformanceTimeSeconds;
  const init = useCallback(() => {
    setActivePattern(getViewingPatternData().id);
    const drawTime = [-2, 2];
    const drawContext = getDrawContext();
    const editor = new StrudelMirror({
      sync: isSyncEnabled,
      defaultOutput,
      getTime,
      setInterval,
      clearInterval,
      transpiler,
      autodraw: false,
      root: containerRef.current,
      initialCode,
      pattern: silence,
      drawTime,
      drawContext,
      prebake: async () => {
        await Promise.all([modulesLoading, presets]);
        if (prebakeScript) {
          return evaluate(prebakeScript, { addReturn: false });
        }
      },
      onUpdateState: (state) => {
        setReplState({ ...state });
      },
      onToggle: (playing) => {
        if (!playing) {
          clearHydra();
        }
      },
      beforeEval: () => audioReady,
      afterEval: (all) => {
        try {
          const { code } = all;
          const currentStage = getViewingPatternData();
          const fullBufferCode = editorRef.current?.code || code || '';
          setLatestCode(fullBufferCode);
          
          const codeHash = code2hash(fullBufferCode);
          console.log('[history] afterEval triggered for ID:', currentStage?.id || 'SCRATCHPAD');
          
          if ((!currentStage?.id || currentStage.id === 'new') && fullBufferCode.trim()) {
            // Initial project creation
            async function createInitialProject() {
              const newId = codeHash.substring(0, 8);
              const newData = { 
                ...currentStage, 
                id: newId, 
                code: fullBufferCode,
                history: [{ timestamp: Date.now(), code: fullBufferCode }] // Initialize history
              };
              await userPattern.update(newId, newData);
              setActivePattern(newId);
              setViewingPatternData(newData);
              window.history.pushState({}, '', `${window.location.pathname}#${newId}`);
            }
            createInitialProject();
          } else if (currentStage?.id && currentStage.id !== 'new') {
            // Update existing project in local store
            const history = currentStage.history || [];
            const lastEntry = history[history.length - 1];
            
            let updatedHistory = history;
            const isChanged = !lastEntry || lastEntry.code !== fullBufferCode;
            
            if (isChanged) {
              updatedHistory = [...history, { 
                timestamp: Date.now(), 
                code: fullBufferCode 
              }].slice(-100); // Increased to 100 entries

              const updatedData = { 
                ...currentStage, 
                code: fullBufferCode,
                history: updatedHistory
              };
              
              userPattern.update(currentStage.id, updatedData).then(() => {
                setViewingPatternData(updatedData); // Sync with session state
                console.log('[history] Snapshot saved. New total:', updatedHistory.length);
                logger(`[history] snapshot saved (${updatedHistory.length})`, 'info');
              });
            } else {
              console.log('[history] Code unchanged, no snapshot needed.');
            }

            // Keep the hash as the ID, don't put the code in it
            if (window.location.hash !== `#${currentStage.id}`) {
              window.history.replaceState({}, '', `${window.location.pathname}#${currentStage.id}`);
            }
          } else {
            // Scratchpad mode: standard Strudel behavior
            window.location.hash = '#' + codeHash;
          }

          setDocumentTitle(fullBufferCode);
          setVersionDefaultsFrom(fullBufferCode);

          // Recording logic
          if (recordingRef.current.isArmed && !recordingRef.current.isRecording) {
            const now = new Date();
            recordingRef.current.startTime = now;
            recordingRef.current.isRecording = true;
            recordingRef.current.isArmed = false;
            recordingRef.current.lastCode = fullBufferCode;
            const initialEntry = `===== [ 00:00:00 ]\n${fullBufferCode}`;
            recordingRef.current.history = [initialEntry];
            
            setIsRecording(true);
            setIsArmed(false);
            setStartTime(now);
            setRecordingHistory([initialEntry]);
            logger('[recording] ⏺ recording started');
          } else if (recordingRef.current.isRecording) {
            const now = new Date();
            const totalMs = now - (recordingRef.current.startTime || now);
            const units = Math.floor(totalMs / 50);
            const subSecond = (units % 20).toString().padStart(2, '0');
            const totalSeconds = Math.floor(totalMs / 1000);
            const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
            const s = (totalSeconds % 60).toString().padStart(2, '0');
            const timestamp = `${m}:${s}:${subSecond}`;
            
            const diff = computeDiff(recordingRef.current.lastCode, fullBufferCode);
            if (diff !== '// no changes') {
              const entry = `===== [ ${timestamp} ]\n${diff}`;
              recordingRef.current.history.push(entry);
              recordingRef.current.lastCode = fullBufferCode;
              setRecordingHistory([...recordingRef.current.history]);
            }
          }
        } catch (e) {
          console.error('[useReplContext] Error in afterEval:', e);
        }
      },
      bgFill: false,
    });
    window.strudelMirror = editor;
    window.debugAudiograph = debugAudiograph;

    // init settings
    initCode().then(async (decoded) => {
      let code, msg;
      const viewingPatternData = getViewingPatternData();
      
      if (viewingPatternData?.code) {
        code = viewingPatternData.code;
        msg = `Stage "${viewingPatternData.name || 'Untitled'}" loaded.`;
      } else if (decoded) {
        code = decoded;
        msg = `I have loaded the code from the URL.`;
      } else if (latestCode) {
        code = latestCode;
        msg = `Your last session has been loaded!`;
      } else {
        /* const { code: randomTune, name } = await getRandomTune();
        code = randomTune; */
        code = '$: s("[bd <hh oh>]*2").bank("tr909").dec(.4)';
        msg = `Default code has been loaded`;
      }
      editor.setCode(code);
      setDocumentTitle(code);
      logger(`Welcome to Strudel! ${msg} Press play or hit ctrl+enter to run it!`, 'highlight');
    });

    editorRef.current = editor;

    // Set up global analyser for Kāl Sidebar visualizer
    // This connects the master output to analyser 1, which the SignalVisualizer uses
    try {
      const analyser = getAnalyserById(1);
      const controller = getSuperdoughAudioController();
      if (controller?.output?.destinationGain) {
        controller.output.destinationGain.connect(analyser);
      }
    } catch (e) {
      console.warn('[useReplContext] Failed to connect global analyser:', e);
    }
  }, []);

  const [replState, setReplState] = useState({});
  const { started, isDirty, error, activeCode, pending } = replState;
  const editorRef = useRef();
  const containerRef = useRef();

  // Recording Engine State
  const [isArmed, setIsArmed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [recordingHistory, setRecordingHistory] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    async function loadRecordings() {
      try {
        const savedRecs = [];
        await recordingsDB.iterate((value) => {
          savedRecs.push(value);
        });
        setRecordings(savedRecs.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (e) {
        console.error('Failed to load recordings', e);
      }
    }
    loadRecordings();
  }, []);

  // Ref to store recording state for the editor's afterEval closure
  const recordingRef = useRef({
    isArmed: false,
    isRecording: false,
    startTime: null,
    history: [],
    lastCode: ''
  });

  // Sync ref with state
  useEffect(() => {
    recordingRef.current.isArmed = isArmed;
    recordingRef.current.isRecording = isRecording;
    recordingRef.current.startTime = startTime;
    recordingRef.current.history = recordingHistory;
  }, [isArmed, isRecording, startTime, recordingHistory]);

  const stopRecording = useCallback(async () => {
    if (!isRecording) return;
    
    const now = new Date();
    const duration = ((now - startTime) / 1000).toFixed(1);
    const sessionContent = recordingHistory.join('\n\n');
    
    const viewingPatternData = getViewingPatternData();
    const currentStageId = viewingPatternData?.id;
    const stageName = viewingPatternData?.name || 'Untitled';
    const dateStr = now.toISOString().split('T')[0];
    
    // Calculate recNo for this project
    const stageRecCount = recordings.filter(r => r.projectId === currentStageId).length;
    const recNo = (stageRecCount + 1).toString().padStart(2, '0');
    
    const fileName = `${stageName} - ${dateStr} - ${recNo}.kal`;
    
    const newRecording = {
      id: Date.now(),
      projectId: currentStageId,
      name: fileName,
      content: sessionContent,
      date: now.toISOString(),
      duration: `${duration}s`
    };
    
    const updatedRecordings = [newRecording, ...recordings];
    setRecordings(updatedRecordings);
    await recordingsDB.setItem(newRecording.id.toString(), newRecording);
    
    setIsRecording(false);
    setStartTime(null);
    setRecordingHistory([]);
    
    // Also update ref
    recordingRef.current.isRecording = false;
    recordingRef.current.startTime = null;
    recordingRef.current.history = [];
    
    logger('[recording] ⏺ recording saved');
  }, [isRecording, startTime, recordingHistory, recordings]);

  const toggleArm = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      setIsArmed(!isArmed);
    }
  }, [isArmed, isRecording, stopRecording]);

  // this can be simplified once SettingsTab has been refactored to change codemirrorSettings directly!
  // this will be the case when the main repl is being replaced
  const _settings = useStore(settingsMap, { keys: Object.keys(defaultSettings) });
  useEffect(() => {
    let editorSettings = {};
    Object.keys(defaultSettings).forEach((key) => {
      // Don't use hasOwnProperty - nanostore uses proxies so values may not be own properties
      editorSettings[key] = _settings[key];
    });
    editorRef.current?.updateSettings(editorSettings);
  }, [_settings]);

  //
  // UI Actions
  //

  const setDocumentTitle = (code) => {
    const meta = getMetadata(code);
    document.title = (meta.title ? `${meta.title} - ` : '') + 'Strudel REPL';
  };

  const handleTogglePlay = useCallback(async () => {
    if (editorRef.current) {
      const playing = editorRef.current.repl.scheduler.started;
      await editorRef.current.toggle();
      
      // We don't need to manually start recording here anymore, 
      // as it will be handled by afterEval when the play button triggers evaluate
      if (playing && isRecording) {
        stopRecording();
      }
    }
  }, [isRecording, stopRecording]);

  const resetEditor = async () => {
    if (!editorRef.current) return;
    (await getModule('@strudel/tonal'))?.resetVoicings();
    resetDefaults();
    resetGlobalEffects();
    clearCanvas();
    clearHydra();
    resetLoadedSounds();
    editorRef.current.repl.setCps(0.5);
    await prebake(); // declare default samples
  };

  const handleEvaluate = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.evaluate();
      // Logic moved to afterEval for consistency
    }
  }, []);

  const handleUpdate = useCallback(async (patternData, reset = false) => {
    setViewingPatternData(patternData);
    editorRef.current.setCode(patternData.code);
    if (reset) {
      await resetEditor();
      handleEvaluate();
    }
  }, [handleEvaluate]);

  const handleRollback = useCallback((historyEntry) => {
    if (editorRef.current) {
      editorRef.current.setCode(historyEntry.code);
      handleEvaluate();
      logger(`[history] ⏪ rolled back to ${new Date(historyEntry.timestamp).toLocaleString()}`);
    }
  }, [handleEvaluate]);

  const handleExport = useCallback(async (begin, end, sampleRate, maxPolyphony, multiChannelOrbits, downloadName = undefined) => {
    await editorRef.current.evaluate(false);
    editorRef.current.repl.scheduler.stop();
    await renderPatternAudio(
      editorRef.current.repl.state.pattern,
      editorRef.current.repl.scheduler.cps,
      begin,
      end,
      sampleRate,
      maxPolyphony,
      multiChannelOrbits,
      downloadName,
    ).finally(async () => {
      const { latestCode, maxPolyphony, audioDeviceName, multiChannelOrbits } = settingsMap.get();
      await initAudio({
        latestCode,
        maxPolyphony,
        audioDeviceName,
        multiChannelOrbits,
      });
      editorRef.current.repl.scheduler.stop();
    });
  }, []);
  const handleShuffle = useCallback(async () => {
    const patternData = await getRandomTune();
    const code = patternData.code;
    logger(`[repl] ✨ loading random tune "${patternData.id}"`);
    setActivePattern(patternData.id);
    setViewingPatternData(patternData);
    await resetEditor();
    editorRef.current.setCode(code);
    editorRef.current.repl.evaluate(code);
  }, []);

  const handleShare = useCallback(async () => {
    let code = replState.code;
    if (includePrebakeScriptInShare) {
      code = prebakeScript + '\n' + code;
    }
    shareCode(code);
  }, [replState.code, includePrebakeScriptInShare, prebakeScript]);

  const handleExportKals = useCallback(async () => {
    let code = replState.code || activeCode || editorRef.current?.code || '';
    await exportToKals(code, recordings);
  }, [replState.code, activeCode, recordings]);
  const context = useMemo(() => ({
    started,
    pending,
    isDirty,
    activeCode,
    handleTogglePlay,
    handleUpdate,
    handleShuffle,
    handleShare,
    handleExportKals,
    handleEvaluate,
    handleExport,
    toggleArm,
    stopRecording,
    isArmed,
    isRecording,
    startTime,
    recordings,
    showHistory,
    setShowHistory,
    handleRollback,
    currentProjectId: getViewingPatternData()?.id,
    init,
    error,
    editorRef,
    containerRef,
  }), [started, pending, isDirty, activeCode, handleTogglePlay, handleUpdate, handleShuffle, handleShare, handleExportKals, handleEvaluate, handleExport, toggleArm, stopRecording, isArmed, isRecording, startTime, recordings, showHistory, setShowHistory, handleRollback, init, error, getViewingPatternData()?.id]);

  return context;
}
