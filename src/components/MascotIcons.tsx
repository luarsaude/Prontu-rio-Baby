import React from 'react';

// Cute teddy bear holding a heart as featured on the reference mockup
export const MascotBear: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 120 }) => {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Left Ear */}
        <circle cx="50" cy="55" r="28" fill="#D9823B" />
        <circle cx="50" cy="55" r="16" fill="#F8C496" />

        {/* Right Ear */}
        <circle cx="150" cy="55" r="28" fill="#D9823B" />
        <circle cx="150" cy="55" r="16" fill="#F8C496" />

        {/* Head */}
        <ellipse cx="100" cy="92" rx="68" ry="60" fill="#E69146" />
        {/* Head highlight */}
        <ellipse cx="100" cy="80" rx="55" ry="46" fill="#EE9F57" />

        {/* Snout */}
        <ellipse cx="100" cy="108" rx="32" ry="24" fill="#FDE1C7" />
        {/* Nose */}
        <ellipse cx="100" cy="98" rx="11" ry="8" fill="#422511" />
        {/* Nose shine */}
        <ellipse cx="98" cy="96" rx="3.5" ry="2" fill="#FFFFFF" opacity="0.8" />
        {/* Mouth */}
        <path
          d="M100 106V114M100 114C95 119 88 116 88 113M100 114C105 119 112 116 112 113"
          stroke="#422511"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Left Eye */}
        <circle cx="72" cy="85" r="9" fill="#2C1810" />
        <circle cx="75" cy="82" r="3.5" fill="#FFFFFF" />
        <circle cx="70" cy="88" r="1.5" fill="#FFFFFF" />

        {/* Right Eye */}
        <circle cx="128" cy="85" r="9" fill="#2C1810" />
        <circle cx="131" cy="82" r="3.5" fill="#FFFFFF" />
        <circle cx="126" cy="88" r="1.5" fill="#FFFFFF" />

        {/* Cute rosy cheeks */}
        <ellipse cx="58" cy="104" rx="11" ry="7" fill="#FF8DA1" opacity="0.6" />
        <ellipse cx="142" cy="104" rx="11" ry="7" fill="#FF8DA1" opacity="0.6" />

        {/* Little Heart in hands */}
        <path
          d="M100 178C90 170 65 145 65 125C65 110 76 102 88 102C94 102 98 105 100 109C102 105 106 102 112 102C124 102 135 110 135 125C135 145 110 170 100 178Z"
          fill="#FF4B72"
        />
        {/* Heart highlight */}
        <path
          d="M75 118C72 125 76 135 83 142"
          stroke="#FFA5B8"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Left Paw holding heart */}
        <ellipse cx="68" cy="132" rx="15" ry="12" fill="#E69146" transform="rotate(-15 68 132)" />
        <circle cx="68" cy="132" r="6" fill="#F8C496" />

        {/* Right Paw holding heart */}
        <ellipse cx="132" cy="132" rx="15" ry="12" fill="#E69146" transform="rotate(15 132 132)" />
        <circle cx="132" cy="132" r="6" fill="#F8C496" />
      </svg>
    </div>
  );
};

// Cute baby giraffe peeking from the bottom right as seen in reference home screen
export const BabyGiraffe: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 90 }) => {
  return (
    <div className={`select-none pointer-events-none ${className}`} style={{ width: size, height: size * 1.3 }}>
      <svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        {/* Neck */}
        <path d="M42 45L45 130H68L62 45Z" fill="#F8BC42" />
        {/* Neck spots */}
        <ellipse cx="53" cy="65" rx="7" ry="5" fill="#CD7A20" />
        <ellipse cx="57" cy="85" rx="8" ry="6" fill="#CD7A20" />
        <ellipse cx="51" cy="108" rx="6" ry="5" fill="#CD7A20" />

        {/* Little horns */}
        <path d="M43 22L45 12" stroke="#CD7A20" strokeWidth="3" strokeLinecap="round" />
        <circle cx="45" cy="11" r="3.5" fill="#B35D10" />
        <path d="M59 22L61 12" stroke="#CD7A20" strokeWidth="3" strokeLinecap="round" />
        <circle cx="61" cy="11" r="3.5" fill="#B35D10" />

        {/* Ears */}
        <ellipse cx="33" cy="27" rx="8" ry="4.5" fill="#F8BC42" transform="rotate(-30 33 27)" />
        <ellipse cx="33" cy="27" rx="4" ry="2" fill="#FF8FA3" transform="rotate(-30 33 27)" />
        <ellipse cx="69" cy="27" rx="8" ry="4.5" fill="#F8BC42" transform="rotate(30 69 27)" />
        <ellipse cx="69" cy="27" rx="4" ry="2" fill="#FF8FA3" transform="rotate(30 69 27)" />

        {/* Head */}
        <ellipse cx="51" cy="30" rx="16" ry="14" fill="#F8BC42" />

        {/* Muzzle */}
        <ellipse cx="51" cy="37" rx="12" ry="8" fill="#FDE1A9" />
        {/* Nostrils */}
        <circle cx="48" cy="36" r="1.5" fill="#8B4E15" />
        <circle cx="54" cy="36" r="1.5" fill="#8B4E15" />
        {/* Smile */}
        <path d="M48 40C49.5 42 52.5 42 54 40" stroke="#8B4E15" strokeWidth="1.5" strokeLinecap="round" />

        {/* Eyes */}
        <circle cx="44" cy="27" r="3" fill="#2D1A0D" />
        <circle cx="45" cy="26" r="1" fill="#FFFFFF" />
        <circle cx="58" cy="27" r="3" fill="#2D1A0D" />
        <circle cx="59" cy="26" r="1" fill="#FFFFFF" />

        {/* Rosy blush */}
        <circle cx="39" cy="33" r="3" fill="#FF94A8" opacity="0.6" />
        <circle cx="63" cy="33" r="3" fill="#FF94A8" opacity="0.6" />
      </svg>
    </div>
  );
};

// Cute baby boy avatar for Lucas
export const BabyAvatar: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 52 }) => {
  return (
    <div
      className={`rounded-full overflow-hidden bg-sky-100 border-2 border-sky-300 flex items-center justify-center shrink-0 shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Background */}
        <circle cx="40" cy="40" r="40" fill="#E0F2FE" />
        {/* Hair */}
        <path d="M22 36C20 22 28 12 40 12C52 12 60 22 58 36C55 27 46 22 40 22C34 22 25 27 22 36Z" fill="#5A3825" />
        {/* Face */}
        <circle cx="40" cy="42" r="22" fill="#FDD9B5" />
        {/* Hair tuft bangs */}
        <path d="M28 28C32 23 38 25 40 23C43 25 49 23 52 28C48 26 44 26 40 27C36 26 32 26 28 28Z" fill="#5A3825" />
        {/* Cheeks */}
        <circle cx="28" cy="46" r="4" fill="#FFA3B5" opacity="0.7" />
        <circle cx="52" cy="46" r="4" fill="#FFA3B5" opacity="0.7" />
        {/* Eyes */}
        <circle cx="33" cy="41" r="2.8" fill="#3D2314" />
        <circle cx="34" cy="40" r="1" fill="#FFFFFF" />
        <circle cx="47" cy="41" r="2.8" fill="#3D2314" />
        <circle cx="48" cy="40" r="1" fill="#FFFFFF" />
        {/* Smile */}
        <path d="M37 47C38.5 50 41.5 50 43 47" stroke="#3D2314" strokeWidth="2" strokeLinecap="round" />
        {/* Baby body / shirt */}
        <path d="M18 78C18 64 26 59 40 59C54 59 62 64 62 78H18Z" fill="#38BDF8" />
        {/* Collar */}
        <path d="M33 59C35 63 39 64 40 64C41 64 45 63 47 59" stroke="#FFFFFF" strokeWidth="2.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

// Realistic Chest X-ray graphic for the X-Ray demo preview in Exames & Scanner
export const XRayPreview: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative bg-neutral-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center p-3 select-none ${className}`}>
      {/* Film texture glow */}
      <div className="absolute inset-0 bg-radial from-neutral-800/40 via-neutral-950 to-black pointer-events-none" />
      
      <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-h-48 object-contain">
        {/* Spine */}
        <rect x="116" y="20" width="8" height="140" rx="2" fill="#E2E8F0" opacity="0.6" />
        {/* Clavicles */}
        <path d="M60 38C80 34 110 40 120 44C130 40 160 34 180 38" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" opacity="0.5" />

        {/* Ribs Left */}
        <path d="M115 55C85 52 65 65 65 80" stroke="#94A3B8" strokeWidth="4.5" strokeLinecap="round" opacity="0.65" />
        <path d="M115 72C80 70 60 85 62 100" stroke="#94A3B8" strokeWidth="4.5" strokeLinecap="round" opacity="0.65" />
        <path d="M115 90C78 88 58 105 60 122" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        <path d="M115 108C82 107 65 125 68 140" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
        <path d="M115 126C88 126 75 142 78 152" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />

        {/* Ribs Right */}
        <path d="M125 55C155 52 175 65 175 80" stroke="#94A3B8" strokeWidth="4.5" strokeLinecap="round" opacity="0.65" />
        <path d="M125 72C160 70 180 85 178 100" stroke="#94A3B8" strokeWidth="4.5" strokeLinecap="round" opacity="0.65" />
        <path d="M125 90C162 88 182 105 180 122" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        <path d="M125 108C158 107 175 125 172 140" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
        <path d="M125 126C152 126 165 142 162 152" stroke="#94A3B8" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />

        {/* Heart shadow / silhouette */}
        <path d="M112 80C125 80 145 105 138 135C132 142 110 145 105 138C98 128 100 95 112 80Z" fill="#CBD5E1" opacity="0.35" />

        {/* Lung fields transparent dark areas */}
        <ellipse cx="88" cy="98" rx="22" ry="38" fill="#1E293B" opacity="0.8" />
        <ellipse cx="152" cy="98" rx="22" ry="38" fill="#1E293B" opacity="0.8" />

        {/* Little inflammatory area annotation tag as noted in mockup */}
        <circle cx="82" cy="110" r="12" fill="#E11D48" fillOpacity="0.25" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x="50" y="145" fill="#F43F5E" fontSize="9" fontWeight="700" fontFamily="sans-serif">inflamação</text>

        {/* Hospital label text overlay */}
        <text x="15" y="24" fill="#94A3B8" fontSize="8" fontFamily="monospace">LUCAS • 5 ANOS • PA</text>
        <text x="15" y="34" fill="#64748B" fontSize="7" fontFamily="monospace">RX TORAX • 20/08/2025</text>
      </svg>

      {/* Grid crosshair watermark */}
      <div className="absolute bottom-2 right-2 text-[10px] font-mono text-neutral-500 bg-neutral-900/80 px-2 py-0.5 rounded border border-neutral-800">
        RX-TÓRAX
      </div>
    </div>
  );
};
