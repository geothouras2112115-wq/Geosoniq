import React from 'react';

interface GeoSoniqLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const GeoSoniqLogo: React.FC<GeoSoniqLogoProps> = ({
  className = '',
  size = 42,
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center space-x-2.5 ${className}`}>
      <img
        src="/assets/aistudio/image_492a3ed4.png"
        alt="GeoSoniq — Study Geology With Us"
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover bg-white ring-2 ring-amber-400/60 shadow-xl"
      />

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-extrabold text-lg tracking-tight font-sans">
            <span className="text-white">Geo</span>
            <span className="text-amber-400">Soniq</span>
          </span>
          <span className="text-[10px] uppercase tracking-widest text-sky-300 font-semibold">
            STUDY GEOLOGY WITH US
          </span>
        </div>
      )}
    </div>
  );
};
