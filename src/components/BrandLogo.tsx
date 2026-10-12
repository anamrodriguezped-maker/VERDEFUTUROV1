import React, { useState } from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeClasses[size]} shrink-0 rounded-2xl overflow-hidden bg-slate-900 border border-emerald-500/30 shadow-md shadow-emerald-500/10 flex items-center justify-center p-0.5`}>
        {!imageError ? (
          <img
            src="/logo.jpeg"
            alt="Logo Verde Futuro"
            className="w-full h-full object-cover rounded-xl"
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <svg viewBox="0 0 100 120" className="w-full h-full text-emerald-400" fill="none">
            {/* Bombilla / Gota híbrida */}
            <path
              d="M50 10 C30 35 15 55 15 75 C15 95 30 105 50 105 C70 105 85 95 85 75 C85 55 70 35 50 10 Z"
              fill="rgba(16, 185, 129, 0.15)"
              stroke="currentColor"
              strokeWidth="4"
            />
            {/* Sol */}
            <circle cx="50" cy="38" r="9" fill="#F59E0B" />
            {/* Planta brote */}
            <path d="M50 85 Q50 60 50 50" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
            <path d="M50 62 Q35 55 35 68 Q45 72 50 65" fill="#10B981" />
            <path d="M50 55 Q65 48 65 61 Q55 65 50 58" fill="#34D399" />
            {/* Circuito */}
            <path d="M26 68 H32 V78 H24" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
            <circle cx="24" cy="78" r="2" fill="#06B6D4" />
            {/* Rosca bombilla */}
            <path d="M38 108 H62 M40 113 H60 M44 118 H56" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-base font-extrabold tracking-tight text-white leading-tight">
            VERDE <span className="text-emerald-400">FUTURO</span>
          </span>
          <span className="text-[10px] tracking-wide text-slate-400 font-medium uppercase">
            STEM+ · Hidroponía IoT
          </span>
        </div>
      )}
    </div>
  );
};
