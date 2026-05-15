import React, { useEffect, useRef, useState } from 'react';
import { analysers, getAnalyzerData, getAnalyserById } from '@strudel/webaudio';
import { useSettings, setVisualizerMode } from '@src/settings.mjs';
import { ChartBarIcon, Squares2X2Icon, ViewColumnsIcon, VariableIcon } from '@heroicons/react/24/outline';

// --- Waveform (Existing) ---
export function WaveformVisualizer({ started, color = '#c9a84c' }) {
  const canvasRef = useRef(null);
  const requestRef = useRef();

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = Math.floor(canvas.clientWidth * dpr);
    const displayHeight = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    const ctx = canvas.getContext('2d');
    let analyser = analysers[1];
    if (!analyser && started) analyser = getAnalyserById(1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!started || !analyser) {
       ctx.strokeStyle = color + '22';
       ctx.beginPath(); ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2); ctx.stroke();
       requestRef.current = requestAnimationFrame(draw);
       return;
    }

    const dataArray = getAnalyzerData('time', 1);
    const bufferSize = analyser.frequencyBinCount;
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    const sliceWidth = canvas.width / bufferSize;
    let x = 0;
    for (let i = 0; i < bufferSize; i++) {
      const v = dataArray[i];
      const y = ((1 - v) * canvas.height) / 2;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.stroke();
    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(requestRef.current);
  }, [started, color]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

// --- Ridge / Waterfall (Isometric 3D Terrain) ---
export function RidgeVisualizer({ started, color = '#c9a84c' }) {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const historyRef = useRef([]);

  // Golden palette matching the Kāl theme
  const RIDGE_COLOR = { r: 201, g: 168, b: 76 };
  const MAX_LINES = 30;
  const SAMPLE_COUNT = 80;

  const drawBorder = (ctx, w, h, dpr) => {
    const pad = 6 * dpr;
    const radius = 14 * dpr;
    ctx.strokeStyle = `rgba(${RIDGE_COLOR.r}, ${RIDGE_COLOR.g}, ${RIDGE_COLOR.b}, 0.18)`;
    ctx.lineWidth = 1.2 * dpr;
    ctx.beginPath();
    ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, radius);
    ctx.stroke();
  };

  const getIsometricParams = (t, w, h) => {
    // t = 0 (front/bottom-right) to 1 (back/top-left)
    // Rotated 45° CW: viewer looks from bottom-right corner
    // Lines shift LEFT and UP as they recede into the distance
    const yBase = h * 0.92 - t * h * 0.68;
    const xEnd = w * 0.94 - t * w * 0.14;
    const lineW = w * 0.78 * (1 - t * 0.38);
    const xStart = xEnd - lineW;
    const ampScale = 110 * (1 - t * 0.45);
    return { yBase, xStart, lineW, ampScale };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = Math.floor(canvas.clientWidth * dpr);
    const displayHeight = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    let analyser = analysers[1];
    if (!analyser && started) analyser = getAnalyserById(1);

    ctx.clearRect(0, 0, w, h);

    if (!started || !analyser) {
      // Idle state — draw a subtle isometric grid
      for (let i = 0; i < MAX_LINES; i++) {
        const t = i / MAX_LINES;
        const { yBase, xStart, lineW } = getIsometricParams(t, w, h);
        const alpha = 0.07 * (1 - t * 0.6);
        ctx.beginPath();
        ctx.moveTo(xStart, yBase);
        ctx.lineTo(xStart + lineW, yBase);
        ctx.strokeStyle = `rgba(${RIDGE_COLOR.r}, ${RIDGE_COLOR.g}, ${RIDGE_COLOR.b}, ${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      drawBorder(ctx, w, h, dpr);
      requestRef.current = requestAnimationFrame(draw);
      return;
    }

    // Downsample for cleaner waveform lines
    const rawData = getAnalyzerData('time', 1);
    const step = Math.max(1, Math.floor(rawData.length / SAMPLE_COUNT));
    const sampled = new Float32Array(SAMPLE_COUNT);
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      sampled[i] = rawData[Math.min(i * step, rawData.length - 1)];
    }

    // Reversed flow: newest data goes to back, oldest at front
    historyRef.current.push(sampled);
    if (historyRef.current.length > MAX_LINES) historyRef.current.shift();

    // Draw ridges back-to-front for proper occlusion
    for (let index = historyRef.current.length - 1; index >= 0; index--) {
      const data = historyRef.current[index];
      const t = index / MAX_LINES; // 0 = front, 1 = back
      const { yBase, xStart, lineW, ampScale } = getIsometricParams(t, w, h);

      // Build filled path
      ctx.beginPath();
      ctx.moveTo(xStart, yBase);

      for (let i = 0; i < data.length; i++) {
        const x = xStart + (i / data.length) * lineW;
        const y = yBase - data[i] * ampScale;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(xStart + lineW, yBase);
      ctx.closePath();

      // Solid dark fill for clean occlusion
      ctx.fillStyle = 'rgba(5, 5, 10, 0.94)';
      ctx.fill();

      // Golden stroke with depth fade
      const alpha = 0.25 + (1 - t) * 0.75;
      ctx.strokeStyle = `rgba(${RIDGE_COLOR.r}, ${RIDGE_COLOR.g}, ${RIDGE_COLOR.b}, ${alpha})`;
      ctx.lineWidth = 0.6 + (1 - t) * 0.9;
      ctx.stroke();
    }

    // Border frame
    drawBorder(ctx, w, h, dpr);

    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(requestRef.current);
  }, [started, color]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

// --- Circular Waveform ---
export function CircleVisualizer({ started, color = '#c9a84c' }) {
  const canvasRef = useRef(null);
  const requestRef = useRef();

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = Math.floor(canvas.clientWidth * dpr);
    const displayHeight = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    const ctx = canvas.getContext('2d');
    let analyser = analysers[1];
    if (!analyser && started) analyser = getAnalyserById(1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = canvas.width * 0.25;

    if (!started || !analyser) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = color + '22';
      ctx.stroke();
      requestRef.current = requestAnimationFrame(draw);
      return;
    }

    const dataArray = getAnalyzerData('time', 1);
    const bufferSize = analyser.frequencyBinCount;
    
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    for (let i = 0; i < bufferSize; i++) {
      const v = dataArray[i];
      const angle = (i / bufferSize) * Math.PI * 2;
      const r = baseRadius + v * baseRadius * 0.8;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(requestRef.current);
  }, [started, color]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

// --- Heatmap / Spectrogram ---
export function HeatmapVisualizer({ started, color = '#c9a84c' }) {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const offscreenCanvasRef = useRef(null);

  const getColor = (v) => {
    // Inferno-like scale: black -> purple -> red -> gold -> white
    if (v < 0.2) return `rgba(0, 0, 0, ${v * 5})`;
    if (v < 0.4) return `rgb(${Math.floor((v-0.2) * 5 * 80)}, 0, ${Math.floor((v-0.2) * 5 * 150)})`;
    if (v < 0.7) return `rgb(${Math.floor(80 + (v-0.4) * 3.33 * 175)}, 0, 0)`;
    if (v < 0.9) return `rgb(255, ${Math.floor((v-0.7) * 5 * 200)}, 0)`;
    return `rgb(255, 255, ${Math.floor((v-0.9) * 10 * 255)})`;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = Math.floor(canvas.clientWidth * dpr);
    const displayHeight = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    const ctx = canvas.getContext('2d');
    let analyser = analysers[1];
    if (!analyser && started) analyser = getAnalyserById(1);

    if (!offscreenCanvasRef.current) {
        offscreenCanvasRef.current = document.createElement('canvas');
        offscreenCanvasRef.current.width = canvas.width;
        offscreenCanvasRef.current.height = canvas.height;
    } else if (offscreenCanvasRef.current.width !== canvas.width || offscreenCanvasRef.current.height !== canvas.height) {
        offscreenCanvasRef.current.width = canvas.width;
        offscreenCanvasRef.current.height = canvas.height;
    }
    const offscreenCtx = offscreenCanvasRef.current.getContext('2d');

    if (!started || !analyser) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      requestRef.current = requestAnimationFrame(draw);
      return;
    }

    const dataArray = getAnalyzerData('frequency', 1);
    const bufferSize = analyser.frequencyBinCount;

    // Shift existing image faster for shorter time response
    const scrollSpeed = 2;
    const imageData = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height - scrollSpeed);
    offscreenCtx.putImageData(imageData, 0, scrollSpeed);

    // Draw new rows
    const barWidth = canvas.width / (bufferSize / 2); // Show only lower half of frequencies for more detail
    for (let i = 0; i < bufferSize / 2; i++) {
      const v = (dataArray[i] + 120) / 100; // Normalize -120..-20 to 0..1
      const normalized = Math.max(0, Math.min(1, v));
      offscreenCtx.fillStyle = getColor(normalized);
      offscreenCtx.fillRect(i * barWidth, 0, barWidth + 1, scrollSpeed);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvasRef.current, 0, 0);

    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(requestRef.current);
  }, [started, color]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

export function VisualizerSuite({ started, color }) {
  const { visualizerMode } = useSettings();
  const mode = visualizerMode || 'waveform';
  const setMode = setVisualizerMode;
  
  const modes = [
    { id: 'waveform', label: 'Wave', icon: ChartBarIcon },
    { id: 'ridge', label: 'Ridge', icon: ViewColumnsIcon },
    { id: 'circle', label: 'Circle', icon: VariableIcon },
    { id: 'heatmap', label: 'Heat', icon: Squares2X2Icon },
  ];

  const currentIndex = modes.findIndex(m => m.id === mode);
  
  const nextMode = () => {
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex].id);
  };

  const prevMode = () => {
    const prevIndex = (currentIndex - 1 + modes.length) % modes.length;
    setMode(modes[prevIndex].id);
  };

  return (
    <div className="w-full h-full relative group/suite overflow-hidden">
      <div className="w-full h-full bg-[#050505]/50">
        {mode === 'waveform' && <WaveformVisualizer started={started} color={color} />}
        {mode === 'ridge' && <RidgeVisualizer started={started} color={color} />}
        {mode === 'circle' && <CircleVisualizer started={started} color={color} />}
        {mode === 'heatmap' && <HeatmapVisualizer started={started} color={color} />}
      </div>
      
      {/* Minimal Floating Selectors */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/5 opacity-0 group-hover/suite:opacity-100 transition-all duration-500 translate-y-2 group-hover/suite:translate-y-0">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`p-1.5 rounded-lg transition-all duration-300 flex items-center justify-center ${
              mode === m.id 
                ? 'bg-primary/20 text-primary shadow-[0_0_12px_rgba(201,168,76,0.3)] border border-primary/30' 
                : 'text-white/30 hover:text-white/60 hover:bg-white/5'
            }`}
            title={m.label}
          >
            <m.icon className="w-3 h-3" />
          </button>
        ))}
      </div>
      
      {/* Mode Label Overlay */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/suite:opacity-40 transition-all duration-700 translate-y-1 group-hover/suite:translate-y-0">
        <span className="font-mono text-[7px] uppercase tracking-[0.6em] text-white whitespace-nowrap">
          {modes.find(m => m.id === mode).label}
        </span>
      </div>

      {/* Subtle corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-20 bg-gradient-to-bl from-primary/20 to-transparent"></div>
    </div>
  );
}
