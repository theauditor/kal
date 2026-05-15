import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Converts a recording timestamp string "MM:SS:FF" to milliseconds.
 * FF = frame index (0–19), each frame = 50ms.
 */
function timestampToMs(str) {
  const parts = str.split(':');
  if (parts.length !== 3) return 0;
  const minutes = parseInt(parts[0], 10) || 0;
  const seconds = parseInt(parts[1], 10) || 0;
  const frames = parseInt(parts[2], 10) || 0;
  return minutes * 60000 + seconds * 1000 + frames * 50;
}

/**
 * Applies a line-level diff to base code to produce the new code state.
 * Diff format: lines starting with "- " are removals, "+ " are additions.
 * Lines without these prefixes are context (ignored in our diff format).
 *
 * Strategy: We process the diff to figure out which old lines were removed
 * and what new lines were added in their place, then reconstruct the full code.
 */
function applyDiff(baseCode, diffText) {
  const baseLines = baseCode.split('\n');
  const diffLines = diffText.split('\n');
  
  // Collect removals and additions in order
  const removals = [];
  const additions = [];
  
  for (const line of diffLines) {
    if (line.startsWith('- ')) {
      removals.push(line.substring(2));
    } else if (line.startsWith('+ ')) {
      additions.push(line.substring(2));
    }
    // Lines starting with "// " or anything else are metadata/comments, skip
  }
  
  // The diff from computeDiff is line-by-line positional:
  // For each line index i, if old[i] !== new[i], we get "- old[i]" then "+ new[i]".
  // If old[i] is undefined (new file is longer), we get only "+ new[i]".
  // If new[i] is undefined (new file is shorter), we get only "- old[i]".
  //
  // To reconstruct: we walk through baseLines and rebuild.
  // We track which removal we're looking for, and replace/remove/add accordingly.
  
  const result = [];
  let removalIdx = 0;
  let additionIdx = 0;
  
  for (let i = 0; i < baseLines.length; i++) {
    if (removalIdx < removals.length && baseLines[i] === removals[removalIdx]) {
      // This line was removed — replace with the corresponding addition if available
      if (additionIdx < additions.length) {
        result.push(additions[additionIdx]);
        additionIdx++;
      }
      // else: line was purely deleted (no replacement)
      removalIdx++;
    } else {
      // Line was unchanged
      result.push(baseLines[i]);
    }
  }
  
  // Any remaining additions are appended lines (file grew longer)
  while (additionIdx < additions.length) {
    result.push(additions[additionIdx]);
    additionIdx++;
  }
  
  return result.join('\n');
}

/**
 * Parses a .kalr recording content string into an array of entries,
 * each with { timestampMs, code } representing the full code state at that point.
 */
function parseRecording(content) {
  if (!content) return [];
  
  // Split on the entry separator pattern
  const rawEntries = content.split(/\n\n(?====== \[)/);
  const entries = [];
  let currentCode = '';
  
  for (const raw of rawEntries) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    
    // Extract timestamp from "===== [ MM:SS:FF ]"
    const headerMatch = trimmed.match(/^=====\s*\[\s*(\d{2}:\d{2}:\d{2})\s*\]/);
    if (!headerMatch) continue;
    
    const timestampMs = timestampToMs(headerMatch[1]);
    // Everything after the header line is the code/diff content
    const bodyStartIdx = trimmed.indexOf('\n');
    const body = bodyStartIdx >= 0 ? trimmed.substring(bodyStartIdx + 1) : '';
    
    if (entries.length === 0) {
      // First entry: body is the full code snapshot
      currentCode = body;
    } else {
      // Subsequent entries: body is a diff, apply it
      if (body && body !== '// no changes') {
        currentCode = applyDiff(currentCode, body);
      }
    }
    
    entries.push({
      timestampMs,
      code: currentCode,
    });
  }
  
  return entries;
}

/**
 * Custom hook for recording playback engine.
 * 
 * @param {Object} editorRef - React ref to the StrudelMirror editor instance
 * @returns Playback state and controls
 */
export function usePlayback(editorRef) {
  const [playingRecordingId, setPlayingRecordingId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [totalDurationMs, setTotalDurationMs] = useState(0);
  
  // Internal refs for the animation loop
  const entriesRef = useRef([]);
  const nextEntryIdxRef = useRef(0);
  const rafIdRef = useRef(null);
  const startWallTimeRef = useRef(0);
  const pausedAtRef = useRef(0);
  const totalPausedMsRef = useRef(0);
  const pauseStartRef = useRef(0);

  const EARLY_MS = 1000; // Apply code 1 second early

  const tick = useCallback(() => {
    if (!isPlaying || isPaused) return;
    
    const entries = entriesRef.current;
    const now = performance.now();
    const elapsed = now - startWallTimeRef.current - totalPausedMsRef.current;
    
    setCurrentTimeMs(elapsed);
    
    // Check if we need to apply the next entry
    while (nextEntryIdxRef.current < entries.length) {
      const entry = entries[nextEntryIdxRef.current];
      // Fire 1 second early (but not before 0)
      const triggerTime = Math.max(0, entry.timestampMs - EARLY_MS);
      
      if (elapsed >= triggerTime) {
        // Apply this entry's code to the editor
        if (editorRef?.current) {
          editorRef.current.setCode(entry.code);
          // Auto-evaluate so the pattern updates live
          editorRef.current.evaluate();
        }
        nextEntryIdxRef.current++;
      } else {
        break;
      }
    }
    
    // Check if playback is complete (past the last entry's timestamp)
    const lastEntry = entries[entries.length - 1];
    if (lastEntry && elapsed >= lastEntry.timestampMs + 2000) {
      // Playback finished — give 2s buffer after last entry
      stopPlayback();
      return;
    }
    
    rafIdRef.current = requestAnimationFrame(tick);
  }, [isPlaying, isPaused, editorRef]);

  // Drive the animation loop
  useEffect(() => {
    if (isPlaying && !isPaused) {
      rafIdRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [isPlaying, isPaused, tick]);

  const startPlayback = useCallback((recording) => {
    if (!recording?.content) return;
    
    const entries = parseRecording(recording.content);
    if (entries.length === 0) return;
    
    entriesRef.current = entries;
    nextEntryIdxRef.current = 0;
    startWallTimeRef.current = performance.now();
    totalPausedMsRef.current = 0;
    pauseStartRef.current = 0;
    
    // Calculate total duration from the last entry
    const lastTs = entries[entries.length - 1].timestampMs;
    setTotalDurationMs(lastTs);
    
    setPlayingRecordingId(recording.id);
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentTimeMs(0);
    
    // Immediately apply the first entry (base code)
    if (entries.length > 0 && editorRef?.current) {
      editorRef.current.setCode(entries[0].code);
      editorRef.current.evaluate();
      nextEntryIdxRef.current = 1; // Skip first entry in the loop
    }
  }, [editorRef]);

  const pausePlayback = useCallback(() => {
    setIsPaused(true);
    pauseStartRef.current = performance.now();
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const resumePlayback = useCallback(() => {
    if (pauseStartRef.current > 0) {
      totalPausedMsRef.current += performance.now() - pauseStartRef.current;
      pauseStartRef.current = 0;
    }
    setIsPaused(false);
  }, []);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setPlayingRecordingId(null);
    setCurrentTimeMs(0);
    setTotalDurationMs(0);
    nextEntryIdxRef.current = 0;
    entriesRef.current = [];
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  /**
   * Seek to a specific time position in the recording.
   * Finds the correct code state and applies it, then resumes from that point.
   */
  const seekTo = useCallback((targetMs) => {
    const entries = entriesRef.current;
    if (entries.length === 0) return;
    
    const clampedMs = Math.max(0, Math.min(targetMs, totalDurationMs));
    
    // Find the latest entry whose trigger time (timestampMs - EARLY_MS) is <= targetMs
    // and apply its code state
    let latestEntryIdx = 0;
    for (let i = 0; i < entries.length; i++) {
      const triggerTime = Math.max(0, entries[i].timestampMs - EARLY_MS);
      if (clampedMs >= triggerTime) {
        latestEntryIdx = i;
      } else {
        break;
      }
    }
    
    // Apply the code at this point
    if (editorRef?.current) {
      editorRef.current.setCode(entries[latestEntryIdx].code);
      editorRef.current.evaluate();
    }
    
    // Set the next entry index to the one after the applied entry
    nextEntryIdxRef.current = latestEntryIdx + 1;
    
    // Recalculate wall-clock offset so elapsed matches clampedMs
    const now = performance.now();
    if (isPaused) {
      // If paused, adjust start time so that when we resume, elapsed = clampedMs
      startWallTimeRef.current = now - clampedMs - totalPausedMsRef.current;
      pauseStartRef.current = now;
    } else {
      startWallTimeRef.current = now - clampedMs - totalPausedMsRef.current;
    }
    
    setCurrentTimeMs(clampedMs);
  }, [totalDurationMs, isPaused, editorRef]);

  return {
    playingRecordingId,
    isPlaying,
    isPaused,
    currentTimeMs,
    totalDurationMs,
    startPlayback,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    seekTo,
  };
}
