import React, { useState } from 'react';

/**
 * SIGNORY Duolingo-Style Badge Icons
 * Beautiful, glossy, 3D vector badges with zero external network dependencies.
 */

// 1. Người Tiên Phong (badge-starter): Golden Rocket & Radiant Flame
const StarterBadge = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="44" fill="#F59E0B" />
    <circle cx="50" cy="48" r="42" fill="#FBBF24" />
    <circle cx="50" cy="48" r="36" fill="url(#starter-grad)" />
    <defs>
      <linearGradient id="starter-grad" x1="50" y1="12" x2="50" y2="84" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
    </defs>
    {/* Inner decorative ring */}
    <circle cx="50" cy="48" r="32" stroke="#FDE68A" strokeWidth="2" strokeDasharray="4 3" opacity="0.8" />
    {/* Rocket body */}
    <g transform="translate(50, 47) rotate(45) translate(-25, -25)">
      {/* Flame */}
      <path d="M18 34 C16 42 25 46 25 46 C25 46 34 42 32 34 Z" fill="#EF4444" />
      <path d="M21 34 C20 39 25 42 25 42 C25 42 30 39 29 34 Z" fill="#FBBF24" />
      {/* Wings */}
      <path d="M12 28 C10 33 16 35 18 33 L18 24 Z" fill="#3B82F6" />
      <path d="M38 28 C40 33 34 35 32 33 L32 24 Z" fill="#3B82F6" />
      {/* Main Hull */}
      <path d="M18 24 C18 14 25 6 25 6 C25 6 32 14 32 24 L32 34 L18 34 Z" fill="#FFFFFF" />
      {/* Nose cone tip */}
      <path d="M20 12 C21 9 25 6 25 6 C25 6 29 9 30 12 Z" fill="#EF4444" />
      {/* Porthole */}
      <circle cx="25" cy="20" r="4" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="1.5" />
      <circle cx="24" cy="19" r="1.2" fill="#FFFFFF" />
    </g>
    {/* Sparkles */}
    <polygon points="25,24 27,29 32,31 27,33 25,38 23,33 18,31 23,29" fill="#FFFBEB" />
    <polygon points="76,68 77,72 81,73 77,75 76,79 74,75 71,73 74,72" fill="#FFFBEB" />
  </svg>
);

// 2. Chinh Phục Mái Ấm (badge-first-lesson): Cozy Duolingo-style Cottage
const HouseBadge = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="44" fill="#10B981" />
    <circle cx="50" cy="48" r="42" fill="#34D399" />
    <circle cx="50" cy="48" r="36" fill="url(#house-grad)" />
    <defs>
      <linearGradient id="house-grad" x1="50" y1="12" x2="50" y2="84" gradientUnits="userSpaceOnUse">
        <stop stopColor="#059669" />
        <stop offset="1" stopColor="#047857" />
      </linearGradient>
    </defs>
    {/* Chimney */}
    <rect x="61" y="24" width="7" height="14" rx="2" fill="#B45309" />
    <ellipse cx="64.5" cy="24" rx="3.5" ry="1.5" fill="#D97706" />
    {/* Smoke bubbles */}
    <circle cx="68" cy="18" r="2.5" fill="#E2E8F0" opacity="0.9" />
    <circle cx="72" cy="13" r="3.5" fill="#E2E8F0" opacity="0.7" />
    {/* House walls */}
    <rect x="28" y="44" width="44" height="28" rx="4" fill="#FEF3C7" />
    {/* Roof */}
    <path d="M22 46 L50 24 L78 46 Z" fill="#EF4444" />
    <path d="M24 45 L50 25 L76 45 Z" fill="#F87171" />
    {/* Door */}
    <path d="M43 54 C43 51 46 49 50 49 C54 49 57 51 57 54 L57 72 L43 72 Z" fill="#B45309" />
    <circle cx="54" cy="62" r="1.5" fill="#FDE68A" />
    {/* Windows */}
    <rect x="32" y="52" width="7" height="8" rx="1.5" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="1.2" />
    <rect x="61" y="52" width="7" height="8" rx="1.5" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="1.2" />
    {/* Little Heart over the house */}
    <path d="M50 37 C50 35 47 33 45 35 C43 37 45 40 50 43 C55 40 57 37 55 35 C53 33 50 35 50 37 Z" fill="#FFFFFF" />
  </svg>
);

// 3. Bậc Thầy 3 Sao (badge-three-stars): Glossy 3-Star Golden Trophy
const ThreeStarsBadge = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="44" fill="#D97706" />
    <circle cx="50" cy="48" r="42" fill="#F59E0B" />
    <circle cx="50" cy="48" r="36" fill="url(#star-grad)" />
    <defs>
      <linearGradient id="star-grad" x1="50" y1="12" x2="50" y2="84" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBF24" />
        <stop offset="1" stopColor="#B45309" />
      </linearGradient>
    </defs>
    {/* Pedestal Ribbon */}
    <path d="M22 66 L50 72 L78 66 L74 80 L50 76 L26 80 Z" fill="#7C3AED" />
    <path d="M26 67 L50 72 L74 67 L71 77 L50 74 L29 77 Z" fill="#8B5CF6" />
    {/* Left Star */}
    <g transform="translate(30, 48) scale(0.65) translate(-25, -25)">
      <polygon points="25,5 31,18 45,19 34,29 38,43 25,35 12,43 16,29 5,19 19,18" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" strokeLinejoin="round" />
    </g>
    {/* Right Star */}
    <g transform="translate(70, 48) scale(0.65) translate(-25, -25)">
      <polygon points="25,5 31,18 45,19 34,29 38,43 25,35 12,43 16,29 5,19 19,18" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" strokeLinejoin="round" />
    </g>
    {/* Center Big Star */}
    <g transform="translate(50, 42) scale(0.95) translate(-25, -25)">
      <polygon points="25,4 32,18 47,19 35,30 39,45 25,37 11,45 15,30 3,19 18,18" fill="#FEF08A" stroke="#EAB308" strokeWidth="2.5" strokeLinejoin="round" />
      {/* 3D Sheen */}
      <polygon points="25,7 30,18 25,35 20,18" fill="#FFFFFF" opacity="0.6" />
    </g>
    <circle cx="50" cy="74" r="2.5" fill="#FDE047" />
  </svg>
);

// 4. Bé Thông Thái (badge-kids-hero): Cute Smart Owl / Superkid Star with Glasses
const KidsHeroBadge = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="44" fill="#0284C7" />
    <circle cx="50" cy="48" r="42" fill="#38BDF8" />
    <circle cx="50" cy="48" r="36" fill="url(#kids-grad)" />
    <defs>
      <linearGradient id="kids-grad" x1="50" y1="12" x2="50" y2="84" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0EA5E9" />
        <stop offset="1" stopColor="#0369A1" />
      </linearGradient>
    </defs>
    {/* Owl / Creature Body */}
    <ellipse cx="50" cy="52" rx="24" ry="22" fill="#58CC02" />
    <ellipse cx="50" cy="54" rx="19" ry="17" fill="#8CE033" />
    {/* Owl Belly Feathers */}
    <ellipse cx="50" cy="58" rx="13" ry="11" fill="#FFFFFF" />
    <path d="M47 55 Q50 57 53 55" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
    <path d="M45 60 Q50 63 55 60" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
    {/* Big Eyes */}
    <circle cx="41" cy="44" r="9" fill="#FFFFFF" stroke="#334155" strokeWidth="2" />
    <circle cx="59" cy="44" r="9" fill="#FFFFFF" stroke="#334155" strokeWidth="2" />
    {/* Sunglasses / Glasses bridge */}
    <rect x="47" y="42" width="6" height="3" rx="1.5" fill="#1E293B" />
    {/* Pupils */}
    <circle cx="42" cy="44" r="4.5" fill="#1E293B" />
    <circle cx="40" cy="42" r="1.8" fill="#FFFFFF" />
    <circle cx="60" cy="44" r="4.5" fill="#1E293B" />
    <circle cx="58" cy="42" r="1.8" fill="#FFFFFF" />
    {/* Beak */}
    <polygon points="50,47 46,52 54,52" fill="#F59E0B" />
    {/* Graduation Cap */}
    <polygon points="50,22 72,29 50,36 28,29" fill="#1E293B" />
    <polygon points="50,24 68,30 50,35 32,30" fill="#334155" />
    <rect x="42" y="34" width="16" height="6" rx="2" fill="#1E293B" />
    {/* Tassel */}
    <circle cx="50" cy="28" r="2" fill="#F59E0B" />
    <path d="M50 28 Q62 31 64 39" stroke="#F59E0B" strokeWidth="2" fill="none" />
    <circle cx="64" cy="40" r="2.5" fill="#F59E0B" />
  </svg>
);

// 5. Gia Đình Gắn Kết (badge-daily-streak): Warm Radiant Loving Hearts
const FamilyBadge = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="44" fill="#E11D48" />
    <circle cx="50" cy="48" r="42" fill="#FB7185" />
    <circle cx="50" cy="48" r="36" fill="url(#family-grad)" />
    <defs>
      <linearGradient id="family-grad" x1="50" y1="12" x2="50" y2="84" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F43F5E" />
        <stop offset="1" stopColor="#BE123C" />
      </linearGradient>
    </defs>
    {/* Radiant heart aura */}
    <circle cx="50" cy="48" r="28" stroke="#FFE4E6" strokeWidth="2" strokeDasharray="3 3" opacity="0.7" />
    {/* Big Heart */}
    <path
      d="M50 68 C50 68 28 53 28 38 C28 29 35 24 42 24 C46 24 49 26 50 29 C51 26 54 24 58 24 C65 24 72 29 72 38 C72 53 50 68 50 68 Z"
      fill="#FFFFFF"
    />
    {/* Inner Heart */}
    <path
      d="M50 64 C50 64 32 50 32 38 C32 31 37 27 43 27 C46 27 49 29 50 31 C51 29 54 27 57 27 C63 27 68 31 68 38 C68 50 50 64 50 64 Z"
      fill="#F43F5E"
    />
    {/* Child Heart nestled inside */}
    <path
      d="M50 56 C50 56 40 48 40 42 C40 38 43 36 46 36 C48 36 49 37 50 38 C51 37 52 36 54 36 C57 36 60 38 60 42 C60 48 50 56 50 56 Z"
      fill="#FEF08A"
    />
    {/* Sparkle */}
    <circle cx="36" cy="34" r="2" fill="#FFFFFF" />
  </svg>
);

// Generic Medal for any other badges created by Admin
const GenericMedalBadge = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="44" fill="#7C3AED" />
    <circle cx="50" cy="48" r="42" fill="#A78BFA" />
    <circle cx="50" cy="48" r="36" fill="url(#generic-grad)" />
    <defs>
      <linearGradient id="generic-grad" x1="50" y1="12" x2="50" y2="84" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8B5CF6" />
        <stop offset="1" stopColor="#6D28D9" />
      </linearGradient>
    </defs>
    {/* Ribbon */}
    <path d="M36 55 L32 82 L46 76 L50 82 L50 55 Z" fill="#F59E0B" />
    <path d="M64 55 L68 82 L54 76 L50 82 L50 55 Z" fill="#D97706" />
    {/* Medallion */}
    <circle cx="50" cy="44" r="20" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
    <circle cx="50" cy="44" r="16" fill="#FDE68A" />
    {/* Laurel / Star */}
    <polygon points="50,32 54,41 64,42 56,49 59,58 50,53 41,58 44,49 36,42 46,41" fill="#F59E0B" />
  </svg>
);

export const BadgeIcon = ({ badge, className = 'w-full h-full' }) => {
  const [imgError, setImgError] = useState(false);

  if (!badge) {
    return <div className={className}><GenericMedalBadge /></div>;
  }

  const badgeId = (badge.id || '').toLowerCase();
  const badgeName = (badge.name || '').toLowerCase();

  // If user provided a custom image URL that is not the broken iconify link and hasn't errored
  const isBrokenIconify = typeof badge.imageUrl === 'string' && badge.imageUrl.includes('iconify.design');
  
  if (badge.imageUrl && !isBrokenIconify && !imgError) {
    return (
      <img
        src={badge.imageUrl}
        alt={badge.name || 'Huy hiệu'}
        onError={() => setImgError(true)}
        className={`${className} object-contain`}
      />
    );
  }

  // Render Duolingo-style SVG based on ID or Name
  let IconComponent = GenericMedalBadge;
  if (badgeId.includes('starter') || badgeName.includes('tiên phong')) {
    IconComponent = StarterBadge;
  } else if (badgeId.includes('first-lesson') || badgeId.includes('home') || badgeName.includes('mái ấm') || badgeName.includes('ở nhà')) {
    IconComponent = HouseBadge;
  } else if (badgeId.includes('three-stars') || badgeId.includes('star') || badgeName.includes('3 sao') || badgeName.includes('sao')) {
    IconComponent = ThreeStarsBadge;
  } else if (badgeId.includes('kids') || badgeName.includes('bé') || badgeName.includes('thông thái')) {
    IconComponent = KidsHeroBadge;
  } else if (badgeId.includes('streak') || badgeId.includes('family') || badgeName.includes('gia đình') || badgeName.includes('gắn kết')) {
    IconComponent = FamilyBadge;
  }

  return (
    <div className={className}>
      <IconComponent />
    </div>
  );
};

export default BadgeIcon;
