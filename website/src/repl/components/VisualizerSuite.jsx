import React, { useEffect, useRef, useState } from 'react';
import { analysers, getAnalyzerData, getAnalyserById } from '@strudel/webaudio';

// --- Waveform (Existing) ---
export function WaveformVisualizer({ started, color = '#c9a84c' }) {
  const canvasRef = useRef(null);
  const requestRef = useRef();

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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

  return <canvas ref={canvasRef} className="w-full h-full" width={400} height={400} />;
}

// --- Ridge / Waterfall ---
export function RidgeVisualizer({ started, color = '#c9a84c' }) {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  const historyRef = useRef([]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let analyser = analysers[1];
    if (!analyser && started) analyser = getAnalyserById(1);

    if (!started || !analyser) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      requestRef.current = requestAnimationFrame(draw);
      return;
    }

    const dataArray = getAnalyzerData('time', 1);
    // Add current frame to history
    historyRef.current.unshift(new Float32Array(dataArray));
    if (historyRef.current.length > 80) historyRef.current.pop();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw from back to front for proper occlusion
    for (let index = historyRef.current.length - 1; index >= 0; index--) {
      const data = historyRef.current[index];
      const depth = index / 80; // 0 (front) to 1 (back)
      const alpha = Math.pow(1 - depth, 1.2); // Reduced fade
      
      // Perspective calculations
      const scale = 0.3 + (1 - depth) * 0.7; // Wider scale
      const yBase = canvas.height * 0.05 + (1 - depth) * canvas.height * 0.85; // Reduced top margin
      const xOffset = (canvas.width * (1 - scale)) / 2;
      
      ctx.beginPath();
      ctx.lineWidth = 1 + (1 - depth) * 1.5;
      
      const sliceWidth = (canvas.width * scale) / data.length;
      
      // Fill under the curve
      ctx.moveTo(xOffset, yBase);
      
      for (let i = 0; i < data.length; i++) {
        const v = data[i];
        const x = xOffset + i * sliceWidth;
        const y = yBase - (v * 100 * scale); // Taller peaks
        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(xOffset + canvas.width * scale, yBase);
      ctx.closePath();

      // Style
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      
      ctx.fillStyle = `rgba(${r * 0.05}, ${g * 0.05}, ${b * 0.05}, ${alpha * 0.9})`;
      ctx.fill();
      
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.stroke();
    }

    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(requestRef.current);
  }, [started, color]);

  return <canvas ref={canvasRef} className="w-full h-full" width={600} height={400} />;
}

// --- Circular Waveform ---
export function CircleVisualizer({ started, color = '#c9a84c' }) {
  const canvasRef = useRef(null);
  const requestRef = useRef();

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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

  return <canvas ref={canvasRef} className="w-full h-full" width={400} height={400} />;
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
    const ctx = canvas.getContext('2d');
    let analyser = analysers[1];
    if (!analyser && started) analyser = getAnalyserById(1);

    if (!offscreenCanvasRef.current) {
        offscreenCanvasRef.current = document.createElement('canvas');
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

  return <canvas ref={canvasRef} className="w-full h-full" width={400} height={400} />;
}

export function VisualizerSuite({ started, color }) {
  const [mode, setMode] = useState('waveform');
  
  const modes = [
    { id: 'waveform', label: 'Wave', icon: 'show_chart' },
    { id: 'ridge', label: 'Ridge', icon: 'Waterfall_Chart' },
    { id: 'circle', label: 'Circle', icon: 'radio_button_checked' },
    { id: 'heatmap', label: 'Heat', icon: 'grid_view' },
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
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              mode === m.id 
                ? 'bg-primary scale-150 shadow-[0_0_12px_rgba(201,168,76,0.6)]' 
                : 'bg-white/10 hover:bg-white/30'
            }`}
            title={m.label}
          />
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
