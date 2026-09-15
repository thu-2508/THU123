import React from 'react';

export type LumiMood = 'greeting' | 'thinking' | 'correct' | 'incorrect' | 'warning' | 'celebrate' | 'rest';

interface LumiRobotProps {
  mood?: LumiMood;
  speechText?: string;
  className?: string;
}

export const LumiRobot: React.FC<LumiRobotProps> = ({
  mood = 'thinking',
  speechText,
  className = '',
}) => {
  const getEyeExpression = () => {
    switch (mood) {
      case 'correct':
      case 'celebrate':
        // Happy arcs
        return (
          <>
            <path d="M28 36 Q34 30 40 36" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M60 36 Q66 30 72 36" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        );
      case 'incorrect':
        // Sympathetic soft round eyes
        return (
          <>
            <circle cx="34" cy="36" r="4" fill="#38bdf8" />
            <circle cx="66" cy="36" r="4" fill="#38bdf8" />
            <path d="M30 30 Q35 32 40 31" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M60 31 Q65 32 70 30" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="none" />
          </>
        );
      case 'warning':
        // Wide alert eyes
        return (
          <>
            <circle cx="34" cy="35" r="5" fill="#facc15" />
            <circle cx="66" cy="35" r="5" fill="#facc15" />
            <circle cx="35" cy="34" r="1.5" fill="#ffffff" />
            <circle cx="67" cy="34" r="1.5" fill="#ffffff" />
          </>
        );
      default:
        // Friendly blinking/glowing default eyes
        return (
          <>
            <circle cx="34" cy="35" r="4.5" fill="#38bdf8" className="animate-pulse" />
            <circle cx="66" cy="35" r="4.5" fill="#38bdf8" className="animate-pulse" />
            <circle cx="35" cy="33.5" r="1.5" fill="#ffffff" />
            <circle cx="67" cy="33.5" r="1.5" fill="#ffffff" />
          </>
        );
    }
  };

  const getMouthExpression = () => {
    switch (mood) {
      case 'correct':
      case 'celebrate':
        return <path d="M42 46 Q50 54 58 46" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none" />;
      case 'incorrect':
        return <path d="M44 49 Q50 46 56 49" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" fill="none" />;
      case 'warning':
        return <ellipse cx="50" cy="48" rx="4" ry="3" fill="#facc15" />;
      default:
        return <path d="M44 47 Q50 51 56 47" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" />;
    }
  };

  const getAntennaColor = () => {
    switch (mood) {
      case 'warning':
        return '#facc15';
      case 'correct':
      case 'celebrate':
        return '#34d399';
      case 'incorrect':
        return '#f87171';
      default:
        return '#818cf8';
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Robot SVG Avatar */}
      <div className="relative flex-shrink-0 group">
        <div className="w-16 h-16 sm:w-20 sm:h-20 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md">
            <defs>
              <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#090d16" />
                <stop offset="100%" stopColor="#111827" />
              </linearGradient>
              <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>

            {/* Antenna with glowing orb */}
            <line x1="50" y1="18" x2="50" y2="8" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="8" r="5" fill={getAntennaColor()} className={mood === 'warning' ? 'animate-ping' : ''} />
            <circle cx="50" cy="8" r="4" fill={getAntennaColor()} />

            {/* Ears / Headset */}
            <rect x="12" y="30" width="6" height="18" rx="3" fill="#6366f1" />
            <rect x="82" y="30" width="6" height="18" rx="3" fill="#6366f1" />

            {/* Head Body */}
            <rect x="16" y="16" width="68" height="52" rx="16" fill="url(#bodyGrad)" stroke="#475569" strokeWidth="2.5" />

            {/* Face Visor Screen */}
            <rect x="22" y="24" width="56" height="34" rx="10" fill="url(#visorGrad)" stroke="#334155" strokeWidth="1.5" />

            {/* Eyes & Mouth */}
            {getEyeExpression()}
            {getMouthExpression()}

            {/* Cute Neck & Mini Shoulders */}
            <rect x="42" y="68" width="16" height="6" rx="2" fill="#475569" />
            <path d="M26 74 Q50 78 74 74 L80 90 Q50 94 20 90 Z" fill="url(#glowGrad)" opacity="0.85" />
            <circle cx="50" cy="84" r="3" fill="#ffffff" opacity="0.9" />
          </svg>
        </div>
        <div className="text-[10px] text-center font-bold tracking-wider text-sky-400 mt-0.5">
          LUMI
        </div>
      </div>

      {/* Speech Bubble */}
      {speechText && (
        <div className="relative bg-slate-900/95 border border-sky-500/30 rounded-2xl px-4 py-2.5 max-w-sm sm:max-w-md shadow-lg shadow-sky-950/50 backdrop-blur-md">
          {/* Arrow */}
          <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-sky-500/30"></div>
          <div className="absolute -left-1.5 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-slate-900"></div>
          <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
            {speechText}
          </p>
        </div>
      )}
    </div>
  );
};
