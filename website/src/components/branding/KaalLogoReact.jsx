import React from 'react';

export const KaalLogoReact = ({ size = 100, className = "", id = "kaal-logo" }) => {
  return (
    <svg
      id={id}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="goldGradReact" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#c9a84c', stopOpacity: 1 }} />
          <stop offset="40%" style={{ stopColor: '#f0d080', stopOpacity: 1 }} />
          <stop offset="70%" style={{ stopColor: '#c9a84c', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#a07830', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="glowReact">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="200" cy="200" r="178" fill="none" stroke="url(#goldGradReact)" strokeWidth="0.8" strokeDasharray="2,5" opacity="0.6" />
      <circle cx="200" cy="200" r="167" fill="none" stroke="url(#goldGradReact)" strokeWidth="0.4" strokeDasharray="1,4" opacity="0.3" />

      <ellipse cx="200" cy="200" rx="148" ry="141" fill="none" stroke="url(#goldGradReact)" strokeWidth="0.6" opacity="0.4" />
      <ellipse cx="200" cy="200" rx="128" ry="122" fill="none" stroke="url(#goldGradReact)" strokeWidth="0.6" opacity="0.45" />
      <ellipse cx="200" cy="200" rx="108" ry="103" fill="none" stroke="url(#goldGradReact)" strokeWidth="0.7" opacity="0.5" />
      <ellipse cx="200" cy="200" rx="88" ry="84" fill="none" stroke="url(#goldGradReact)" strokeWidth="0.7" opacity="0.55" />
      <ellipse cx="200" cy="200" rx="68" ry="65" fill="none" stroke="url(#goldGradReact)" strokeWidth="0.8" opacity="0.6" />

      <path d="M 52,200 Q 70,178 94,195 Q 118,212 142,190 Q 166,168 200,184 Q 234,200 258,184 Q 282,168 306,190 Q 330,212 354,195 Q 372,182 348,200"
            fill="none" stroke="url(#goldGradReact)" strokeWidth="0.7" opacity="0.4" />
      <path d="M 52,200 Q 70,222 94,205 Q 118,188 142,210 Q 166,232 200,216 Q 234,200 258,216 Q 282,232 306,210 Q 330,188 354,205 Q 372,218 348,200"
            fill="none" stroke="url(#goldGradReact)" strokeWidth="0.7" opacity="0.4" />

      <line x1="200" y1="22" x2="200" y2="378" stroke="url(#goldGradReact)" strokeWidth="0.8" opacity="0.7" />
      <line x1="22" y1="200" x2="378" y2="200" stroke="url(#goldGradReact)" strokeWidth="0.8" opacity="0.7" />

      <circle cx="200" cy="25" r="2.8" fill="url(#goldGradReact)" filter="url(#glowReact)" />
      <circle cx="200" cy="52" r="1.8" fill="url(#goldGradReact)" opacity="0.7" />
      <circle cx="200" cy="375" r="2.8" fill="url(#goldGradReact)" filter="url(#glowReact)" />
      <circle cx="200" cy="348" r="1.8" fill="url(#goldGradReact)" opacity="0.7" />
      <circle cx="25" cy="200" r="2.8" fill="url(#goldGradReact)" filter="url(#glowReact)" />
      <circle cx="375" cy="200" r="2.8" fill="url(#goldGradReact)" filter="url(#glowReact)" />

      <path d="M 25,200 L 48,200 L 53,183 L 59,218 L 65,174 L 71,228 L 77,168 L 83,232 L 89,174 L 95,224 L 101,186 L 107,214 L 113,198 L 119,204 L 124,200 L 155,200"
            fill="none" stroke="url(#goldGradReact)" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" filter="url(#glowReact)" opacity="0.9" />

      <path d="M 245,200 L 276,200 L 281,204 L 287,198 L 293,214 L 299,186 L 305,224 L 311,174 L 317,232 L 323,168 L 329,228 L 335,174 L 341,218 L 347,183 L 352,200 L 375,200"
            fill="none" stroke="url(#goldGradReact)" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" filter="url(#glowReact)" opacity="0.9" />

      <polygon points="168,132 232,132 200,214"
               fill="#1c1408" stroke="url(#goldGradReact)" strokeWidth="1.6" strokeLinejoin="round" filter="url(#glowReact)" />

      <polygon points="168,268 232,268 200,186"
               fill="#1c1408" stroke="url(#goldGradReact)" strokeWidth="1.6" strokeLinejoin="round" filter="url(#glowReact)" />

      <polygon points="182,186 218,186 200,214" fill="#1c1408" stroke="none" />
      <line x1="182" y1="186" x2="200" y2="214" stroke="url(#goldGradReact)" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="218" y1="186" x2="200" y2="214" stroke="url(#goldGradReact)" strokeWidth="1.6" strokeLinecap="round" />

      <ellipse cx="200" cy="132" rx="32" ry="8" fill="#251c0a" stroke="url(#goldGradReact)" strokeWidth="1.6" filter="url(#glowReact)" />
      <ellipse cx="200" cy="268" rx="32" ry="8" fill="#251c0a" stroke="url(#goldGradReact)" strokeWidth="1.6" filter="url(#glowReact)" />

      <line x1="184" y1="139" x2="197" y2="205" stroke="url(#goldGradReact)" strokeWidth="0.6" opacity="0.35" />
      <line x1="200" y1="140" x2="200" y2="207" stroke="url(#goldGradReact)" strokeWidth="0.6" opacity="0.35" />
      <line x1="216" y1="139" x2="203" y2="205" stroke="url(#goldGradReact)" strokeWidth="0.6" opacity="0.35" />
      <line x1="184" y1="261" x2="197" y2="195" stroke="url(#goldGradReact)" strokeWidth="0.6" opacity="0.35" />
      <line x1="200" y1="260" x2="200" y2="193" stroke="url(#goldGradReact)" strokeWidth="0.6" opacity="0.35" />
      <line x1="216" y1="261" x2="203" y2="195" stroke="url(#goldGradReact)" strokeWidth="0.6" opacity="0.35" />

      <circle cx="200" cy="200" r="7.5" fill="#0a0a0a" stroke="url(#goldGradReact)" strokeWidth="2.2" filter="url(#glowReact)" />
      <circle cx="200" cy="200" r="3.2" fill="url(#goldGradReact)" filter="url(#glowReact)" />

      <path d="M 194,194 Q 183,182 172,171 Q 167,165 163,159"
            fill="none" stroke="url(#goldGradReact)" strokeWidth="1.3" strokeLinecap="round" opacity="0.95" />
      <circle cx="161" cy="156" r="4.5" fill="url(#goldGradReact)" filter="url(#glowReact)" />
      <circle cx="161" cy="156" r="2.2" fill="#0a0a0a" />

      <path d="M 206,206 Q 217,218 228,229 Q 233,235 237,241"
            fill="none" stroke="url(#goldGradReact)" strokeWidth="1.3" strokeLinecap="round" opacity="0.95" />
      <circle cx="239" cy="244" r="4.5" fill="url(#goldGradReact)" filter="url(#glowReact)" />
      <circle cx="239" cy="244" r="2.2" fill="#0a0a0a" />

      <circle cx="200" cy="118" r="2.8" fill="url(#goldGradReact)" filter="url(#glowReact)" />
      <circle cx="200" cy="282" r="2.8" fill="url(#goldGradReact)" filter="url(#glowReact)" />
    </svg>
  );
};
