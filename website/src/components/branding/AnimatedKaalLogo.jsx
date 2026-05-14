import React from 'react';

export const AnimatedKaalLogo = ({ size = 200, className = "" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="goldGradLoading" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#c9a84c', stopOpacity: 1 }} />
            <stop offset="40%" style={{ stopColor: '#f0d080', stopOpacity: 1 }} />
            <stop offset="70%" style={{ stopColor: '#c9a84c', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#a07830', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="glowLoading">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <style>{`
            @keyframes dash {
              to {
                stroke-dashoffset: 0;
              }
            }
            @keyframes pulse {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.05); }
            }
            @keyframes rotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes wavePulse {
              0%, 100% { stroke-width: 1.3; opacity: 0.9; }
              50% { stroke-width: 2; opacity: 1; filter: blur(1px); }
            }
            
            .animate-dash {
              stroke-dasharray: 1000;
              stroke-dashoffset: 1000;
              animation: dash 3s ease-out forwards;
            }
            .animate-pulse-slow {
              animation: pulse 4s infinite ease-in-out;
            }
            .animate-rotate-slow {
              transform-origin: center;
              animation: rotate 20s linear infinite;
            }
            .animate-fade-in {
              animation: fadeIn 1s ease-out forwards;
            }
            .animate-wave {
              animation: wavePulse 2s infinite ease-in-out;
            }
            .delay-1 { animation-delay: 0.2s; }
            .delay-2 { animation-delay: 0.4s; }
            .delay-3 { animation-delay: 0.6s; }
          `}</style>
        </defs>

        {/* Outer dotted rings - Rotating */}
        <g className="animate-rotate-slow">
          <circle cx="200" cy="200" r="178" fill="none" stroke="url(#goldGradLoading)" strokeWidth="0.8" strokeDasharray="2,5" opacity="0.4" />
          <circle cx="200" cy="200" r="167" fill="none" stroke="url(#goldGradLoading)" strokeWidth="0.4" strokeDasharray="1,4" opacity="0.2" />
        </g>

        {/* Concentric ripple rings - Pulsing */}
        <ellipse cx="200" cy="200" rx="148" ry="141" fill="none" stroke="url(#goldGradLoading)" strokeWidth="0.6" className="animate-pulse-slow delay-1" />
        <ellipse cx="200" cy="200" rx="128" ry="122" fill="none" stroke="url(#goldGradLoading)" strokeWidth="0.6" className="animate-pulse-slow delay-2" />
        <ellipse cx="200" cy="200" rx="108" ry="103" fill="none" stroke="url(#goldGradLoading)" strokeWidth="0.7" className="animate-pulse-slow delay-3" />

        {/* Wavy ripples */}
        <path d="M 52,200 Q 70,178 94,195 Q 118,212 142,190 Q 166,168 200,184 Q 234,200 258,184 Q 282,168 306,190 Q 330,212 354,195 Q 372,182 348,200"
              fill="none" stroke="url(#goldGradLoading)" strokeWidth="0.7" opacity="0.3" className="animate-fade-in delay-1" />
        <path d="M 52,200 Q 70,222 94,205 Q 118,188 142,210 Q 166,232 200,216 Q 234,200 258,216 Q 282,232 306,210 Q 330,188 354,205 Q 372,218 348,200"
              fill="none" stroke="url(#goldGradLoading)" strokeWidth="0.7" opacity="0.3" className="animate-fade-in delay-2" />

        {/* Cross axis lines */}
        <line x1="200" y1="22" x2="200" y2="378" stroke="url(#goldGradLoading)" strokeWidth="0.8" opacity="0.5" className="animate-dash" />
        <line x1="22" y1="200" x2="378" y2="200" stroke="url(#goldGradLoading)" strokeWidth="0.8" opacity="0.5" className="animate-dash" />

        {/* Sound waves - Animated */}
        <path d="M 25,200 L 48,200 L 53,183 L 59,218 L 65,174 L 71,228 L 77,168 L 83,232 L 89,174 L 95,224 L 101,186 L 107,214 L 113,198 L 119,204 L 124,200 L 155,200"
              fill="none" stroke="url(#goldGradLoading)" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" filter="url(#glowLoading)" className="animate-wave" />
        <path d="M 245,200 L 276,200 L 281,204 L 287,198 L 293,214 L 299,186 L 305,224 L 311,174 L 317,232 L 323,168 L 329,228 L 335,174 L 341,218 L 347,183 L 352,200 L 375,200"
              fill="none" stroke="url(#goldGradLoading)" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" filter="url(#glowLoading)" className="animate-wave" />

        {/* Damru (The Drum) - Core */}
        <g className="animate-fade-in">
          <polygon points="168,132 232,132 200,214" fill="#1c1408" stroke="url(#goldGradLoading)" strokeWidth="1.6" strokeLinejoin="round" filter="url(#glowLoading)" />
          <polygon points="168,268 232,268 200,186" fill="#1c1408" stroke="url(#goldGradLoading)" strokeWidth="1.6" strokeLinejoin="round" filter="url(#glowLoading)" />
          <circle cx="200" cy="200" r="7.5" fill="#0a0a0a" stroke="url(#goldGradLoading)" strokeWidth="2.2" filter="url(#glowLoading)" />
          <circle cx="200" cy="200" r="3.2" fill="url(#goldGradLoading)" filter="url(#glowLoading)" />
        </g>
      </svg>
    </div>
  );
};
