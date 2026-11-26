import React from 'react';

const SAKURA_PETALS = [
  // Foreground & canopy-origin wind stream (large, rich)
  { id: 'sp1', right: '6%', size: 22, delay: '-1.2s', duration: '9.5s', kind: 'wide', tone: 0, opacity: 0.92 },
  { id: 'sp2', right: '14%', size: 19, delay: '-4.8s', duration: '10.8s', kind: 'norm', tone: 1, opacity: 0.88 },
  { id: 'sp3', right: '22%', size: 21, delay: '-8.1s', duration: '11.4s', kind: 'wide', tone: 2, opacity: 0.9 },
  { id: 'sp4', right: '3%', size: 17, delay: '-2.6s', duration: '9.2s', kind: 'norm', tone: 3, opacity: 0.85 },
  { id: 'sp5', right: '11%', size: 23, delay: '-6.4s', duration: '12.2s', kind: 'wide', tone: 0, opacity: 0.92 },
  { id: 'sp6', right: '28%', size: 18, delay: '-9.7s', duration: '10.5s', kind: 'norm', tone: 1, opacity: 0.86 },
  { id: 'sp7', right: '18%', size: 20, delay: '-0.4s', duration: '11.8s', kind: 'wide', tone: 2, opacity: 0.88 },
  { id: 'sp8', right: '35%', size: 17, delay: '-5.1s', duration: '12.6s', kind: 'norm', tone: 3, opacity: 0.84 },
  // Mid-sky wind drift
  { id: 'sp9', right: '9%', size: 15, delay: '-3.3s', duration: '13.2s', kind: 'wide', tone: 1, opacity: 0.78 },
  { id: 'sp10', right: '25%', size: 16, delay: '-7.5s', duration: '12.4s', kind: 'norm', tone: 0, opacity: 0.8 },
  { id: 'sp11', right: '42%', size: 15, delay: '-11.0s', duration: '13.8s', kind: 'wide', tone: 2, opacity: 0.76 },
  { id: 'sp12', right: '16%', size: 14, delay: '-1.9s', duration: '11.9s', kind: 'norm', tone: 3, opacity: 0.78 },
  { id: 'sp13', right: '32%', size: 16, delay: '-6.0s', duration: '14.5s', kind: 'wide', tone: 1, opacity: 0.74 },
  { id: 'sp14', right: '48%', size: 15, delay: '-8.9s', duration: '13.0s', kind: 'norm', tone: 0, opacity: 0.76 },
  { id: 'sp15', right: '5%', size: 16, delay: '-10.2s', duration: '11.6s', kind: 'wide', tone: 2, opacity: 0.82 },
  { id: 'sp16', right: '20%', size: 14, delay: '-4.0s', duration: '13.5s', kind: 'norm', tone: 1, opacity: 0.74 },
  { id: 'sp17', right: '38%', size: 16, delay: '-2.2s', duration: '12.8s', kind: 'wide', tone: 3, opacity: 0.76 },
  { id: 'sp18', right: '55%', size: 15, delay: '-7.1s', duration: '14.2s', kind: 'norm', tone: 0, opacity: 0.72 },
  // Distant delicate petals (soft atmospheric depth)
  { id: 'sp19', right: '12%', size: 11, delay: '-5.5s', duration: '15.5s', kind: 'norm', tone: 2, opacity: 0.58 },
  { id: 'sp20', right: '29%', size: 12, delay: '-12.3s', duration: '16.2s', kind: 'wide', tone: 1, opacity: 0.6 },
  { id: 'sp21', right: '46%', size: 11, delay: '-3.8s', duration: '17.0s', kind: 'norm', tone: 3, opacity: 0.55 },
  { id: 'sp22', right: '62%', size: 12, delay: '-9.1s', duration: '15.8s', kind: 'wide', tone: 0, opacity: 0.58 },
  { id: 'sp23', right: '8%', size: 13, delay: '-14.0s', duration: '16.5s', kind: 'norm', tone: 2, opacity: 0.62 },
  { id: 'sp24', right: '24%', size: 11, delay: '-0.9s', duration: '15.0s', kind: 'wide', tone: 1, opacity: 0.58 },
  { id: 'sp25', right: '51%', size: 12, delay: '-6.7s', duration: '16.8s', kind: 'norm', tone: 0, opacity: 0.54 },
  { id: 'sp26', right: '15%', size: 13, delay: '-8.4s', duration: '14.8s', kind: 'wide', tone: 3, opacity: 0.64 },
  { id: 'sp27', right: '34%', size: 12, delay: '-13.1s', duration: '15.4s', kind: 'norm', tone: 2, opacity: 0.6 },
  { id: 'sp28', right: '68%', size: 12, delay: '-4.4s', duration: '16.0s', kind: 'wide', tone: 1, opacity: 0.52 },
];

const LIGHT_TONES = ['#fda4af', '#fbcfe8', '#fff1f2', '#f9a8d4'];
const DARK_TONES = ['#f472b6', '#fbcfe8', '#fda4af', '#f9a8d4'];

const CANOPY_FIREFLIES = [
  { id: 'cf1', right: '14%', bottom: '44%', delay: '0s', duration: '7.5s', size: 7 },
  { id: 'cf2', right: '24%', bottom: '56%', delay: '-2.2s', duration: '9.2s', size: 6 },
  { id: 'cf3', right: '8%', bottom: '62%', delay: '-4.5s', duration: '8.4s', size: 8 },
  { id: 'cf4', right: '30%', bottom: '36%', delay: '-1.3s', duration: '10.1s', size: 5 },
  { id: 'cf5', right: '19%', bottom: '28%', delay: '-5.8s', duration: '8.8s', size: 6 },
  { id: 'cf6', left: '12%', bottom: '22%', delay: '-3.1s', duration: '9.6s', size: 6 },
  { id: 'cf7', left: '22%', bottom: '30%', delay: '-6.4s', duration: '8.2s', size: 7 },
];

/**
 * Painterly game-scenery Cherry Blossom backdrop for Story Map & Wall of Kindness:
 * - Large sweeping sakura tree anchored on the bottom-right corner with multi-layer wind sway
 * - Hanging glowing paper lanterns + perched bird silhouette + misty left stone lantern ridge
 * - 28 wind-swept falling sakura petals across 3 atmospheric depth layers (seamless GPU loops)
 */
export const SakuraTreeBackdrop = ({ isDark = false }) => {
  const palette = isDark ? DARK_TONES : LIGHT_TONES;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* ─── Subtle Left Distant Cherry Silhouette & Stone Lantern Ridge ─── */}
      <svg
        className="absolute bottom-0 left-0 w-[260px] sm:w-[340px] md:w-[400px] h-auto opacity-85"
        viewBox="0 0 360 280"
        fill="none"
      >
        {/* Left foreground grassy cliff silhouette */}
        <path
          d="M0 190 Q60 175 135 205 Q220 232 340 280 L0 280 Z"
          fill={isDark ? '#1a1433' : '#6d4c6b'}
          fillOpacity={isDark ? '0.78' : '0.32'}
        />
        {/* Distant left sakura bush/tree silhouette */}
        <g className="animate-bough-sway-alt" style={{ transformOrigin: '55px 215px' }}>
          <path
            d="M52 215 C52 175, 42 150, 26 125 M48 175 C70 155, 86 142, 102 128"
            stroke={isDark ? '#271c45' : '#6b475d'}
            strokeWidth="7"
            strokeLinecap="round"
            strokeOpacity="0.65"
          />
          <circle cx="32" cy="122" r="34" fill={isDark ? '#9d174d' : '#f9a8d4'} fillOpacity={isDark ? '0.42' : '0.45'} />
          <circle cx="72" cy="116" r="30" fill={isDark ? '#be185d' : '#fbcfe8'} fillOpacity={isDark ? '0.38' : '0.45'} />
          <circle cx="105" cy="128" r="24" fill={isDark ? '#db2777' : '#fda4af'} fillOpacity={isDark ? '0.36' : '0.4'} />
        </g>

        {/* Traditional Stone Lantern silhouette on left ridge */}
        <g transform="translate(132, 154)" opacity={isDark ? '0.9' : '0.68'}>
          <rect x="8" y="34" width="12" height="24" rx="2" fill={isDark ? '#29224a' : '#645269'} />
          <rect x="4" y="55" width="20" height="7" rx="3" fill={isDark ? '#29224a' : '#645269'} />
          <rect x="6" y="18" width="16" height="16" rx="2" fill={isDark ? '#1f1938' : '#554459'} />
          {/* Warm glowing lantern window */}
          <rect x="10" y="21" width="8" height="10" rx="1.5" fill={isDark ? '#fde047' : '#fef08a'} />
          <circle cx="14" cy="26" r="16" fill={isDark ? '#fbbf24' : '#fde047'} fillOpacity={isDark ? '0.28' : '0.35'} />
          {/* Pagoda roof */}
          <path d="M0 19 L14 7 L28 19 Z" fill={isDark ? '#322959' : '#645269'} />
          <circle cx="14" cy="6" r="2.5" fill={isDark ? '#433875' : '#78637d'} />
        </g>

        {/* Gently swaying grass tufts */}
        <g className="animate-grass-sway" style={{ transformOrigin: '35px 275px' }}>
          <path d="M18 275 Q24 235 12 208 Q24 235 28 275" fill={isDark ? '#1e1b3a' : '#5e4661'} fillOpacity="0.65" />
          <path d="M36 275 Q46 230 56 205 Q46 238 44 275" fill={isDark ? '#1e1b3a' : '#5e4661'} fillOpacity="0.6" />
          <path d="M84 278 Q92 246 86 224 Q98 248 94 278" fill={isDark ? '#1e1b3a' : '#5e4661'} fillOpacity="0.55" />
        </g>
      </svg>

      {/* ─── GRAND SWEEPING CHERRY BLOSSOM TREE (RIGHT CORNER) ─── */}
      <div className="absolute -bottom-2 -right-4 sm:right-0 w-[330px] sm:w-[460px] md:w-[560px] lg:w-[640px] max-w-[78vw] select-none">
        <svg
          viewBox="0 0 640 620"
          fill="none"
          className="w-full h-auto drop-shadow-[0_14px_35px_rgba(190,24,93,0.14)]"
        >
          <defs>
            <radialGradient id="sakuraTreeGlow" cx="62%" cy="32%" r="55%">
              <stop offset="0%" stopColor={isDark ? '#f472b6' : '#fda4af'} stopOpacity={isDark ? '0.26' : '0.32'} />
              <stop offset="65%" stopColor={isDark ? '#701a75' : '#fbcfe8'} stopOpacity={isDark ? '0.1' : '0.14'} />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="sakuraTrunkGrad" x1="560" y1="620" x2="360" y2="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isDark ? '#27152e' : '#4a2e35'} />
              <stop offset="55%" stopColor={isDark ? '#3a2042' : '#633f47'} />
              <stop offset="100%" stopColor={isDark ? '#4a2b52' : '#784e57'} />
            </linearGradient>
            <linearGradient id="sakuraBarkLight" x1="530" y1="610" x2="380" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isDark ? '#4f2c5c' : '#855861'} stopOpacity="0.65" />
              <stop offset="100%" stopColor={isDark ? '#743f7d' : '#a6747e'} stopOpacity="0.4" />
            </linearGradient>
            <radialGradient id="lanternWarmGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#fb923c" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Soft atmospheric halo behind blossom canopy */}
          <circle cx="390" cy="215" r="245" fill="url(#sakuraTreeGlow)" />

          {/* Hillock grounding the right-corner cherry tree */}
          <path
            d="M310 620 Q410 555 510 562 Q585 566 640 538 L640 620 Z"
            fill={isDark ? '#1e1638' : '#694763'}
            fillOpacity={isDark ? '0.92' : '0.45'}
          />

          {/* ── Main Tree Trunk & Sweeping Primary Boughs ── */}
          <g className="animate-bough-sway">
            {/* Far back canopy shadow clusters */}
            <g opacity={isDark ? '0.78' : '0.88'}>
              <circle cx="485" cy="195" r="88" fill={isDark ? '#581c4f' : '#f472b6'} fillOpacity="0.45" />
              <circle cx="360" cy="150" r="82" fill={isDark ? '#701a75' : '#fb7185'} fillOpacity="0.4" />
              <circle cx="245" cy="192" r="72" fill={isDark ? '#831843' : '#f472b6'} fillOpacity="0.38" />
              <circle cx="555" cy="128" r="76" fill={isDark ? '#581c4f' : '#fb7185'} fillOpacity="0.42" />
            </g>

            {/* Primary sculpted trunk */}
            <path
              d="M525 620 C518 530, 526 445, 502 365 C484 304, 444 260, 382 222 C338 195, 290 180, 232 184
                 L234 198 C288 198, 336 216, 378 244 C432 280, 462 325, 474 388 C488 456, 476 538, 466 620 Z"
              fill="url(#sakuraTrunkGrad)"
            />
            {/* Secondary upper-right branch */}
            <path
              d="M492 366 C508 310, 536 258, 578 198 C594 176, 616 156, 636 142
                 L628 130 C600 148, 570 176, 548 212 C516 262, 492 308, 476 356 Z"
              fill="url(#sakuraTrunkGrad)"
            />
            {/* Delicate leftward overhanging twig */}
            <path
              d="M362 226 C320 185, 278 150, 214 134 C178 125, 146 128, 120 138
                 C148 134, 180 134, 212 144 C272 162, 314 196, 348 234 Z"
              fill="url(#sakuraTrunkGrad)"
            />
            {/* Lower secondary branch */}
            <path
              d="M480 412 C436 376, 388 352, 332 344 C298 339, 266 346, 240 356
                 C268 352, 300 350, 330 356 C380 366, 424 392, 468 426 Z"
              fill="url(#sakuraTrunkGrad)"
            />
            {/* Subtle warm bark highlight */}
            <path
              d="M500 595 C498 510, 504 432, 484 366 C468 314, 434 274, 382 238"
              stroke="url(#sakuraBarkLight)"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Perched bird silhouette resting serenely on upper twig */}
            <g transform="translate(274, 174)">
              <path
                d="M0 10 C4 2, 12 0, 17 4 C20 6, 22 4, 25 3 C23 7, 21 9, 17 11 C13 13, 6 13, 0 10 Z"
                fill={isDark ? '#f9a8d4' : '#4a2e35'}
                fillOpacity="0.88"
              />
              <path
                d="M1 10 L-7 15 L-2 11 Z"
                fill={isDark ? '#f9a8d4' : '#4a2e35'}
                fillOpacity="0.88"
              />
            </g>

            {/* ── Rich Multi-Layer Blossom Canopy Clouds ── */}
            {/* Mid sakura pink clusters */}
            <g>
              <circle cx="565" cy="145" r="72" fill={isDark ? '#9d174d' : '#fda4af'} fillOpacity={isDark ? '0.72' : '0.88'} />
              <circle cx="495" cy="175" r="78" fill={isDark ? '#be185d' : '#fbcfe8'} fillOpacity={isDark ? '0.68' : '0.92'} />
              <circle cx="425" cy="142" r="74" fill={isDark ? '#db2777' : '#fda4af'} fillOpacity={isDark ? '0.62' : '0.86'} />
              <circle cx="348" cy="168" r="66" fill={isDark ? '#be185d' : '#fbcfe8'} fillOpacity={isDark ? '0.66' : '0.9'} />
              <circle cx="272" cy="176" r="56" fill={isDark ? '#9d174d' : '#f9a8d4'} fillOpacity={isDark ? '0.68' : '0.84'} />
              <circle cx="595" cy="232" r="64" fill={isDark ? '#9d174d' : '#fbcfe8'} fillOpacity={isDark ? '0.65' : '0.88'} />
              <circle cx="452" cy="242" r="58" fill={isDark ? '#be185d' : '#fda4af'} fillOpacity={isDark ? '0.62' : '0.85'} />
            </g>

            {/* Soft sunlit/moonlit top blossom highlights */}
            <g>
              <circle cx="540" cy="118" r="52" fill={isDark ? '#f472b6' : '#ffe4e6'} fillOpacity={isDark ? '0.48' : '0.86'} />
              <circle cx="448" cy="112" r="50" fill={isDark ? '#f9a8d4' : '#fff1f2'} fillOpacity={isDark ? '0.45' : '0.88'} />
              <circle cx="355" cy="134" r="46" fill={isDark ? '#fbcfe8' : '#ffe4e6'} fillOpacity={isDark ? '0.45' : '0.84'} />
              <circle cx="290" cy="148" r="38" fill={isDark ? '#f472b6' : '#fff1f2'} fillOpacity={isDark ? '0.42' : '0.8'} />
              <circle cx="585" cy="186" r="44" fill={isDark ? '#fbcfe8' : '#fff1f2'} fillOpacity={isDark ? '0.44' : '0.85'} />
              <circle cx="212" cy="134" r="40" fill={isDark ? '#db2777' : '#fbcfe8'} fillOpacity={isDark ? '0.58' : '0.86'} />
              <circle cx="152" cy="142" r="30" fill={isDark ? '#f472b6' : '#ffe4e6'} fillOpacity={isDark ? '0.52' : '0.82'} />
            </g>

            {/* Lower overhanging blossom branch */}
            <g>
              <circle cx="348" cy="342" r="42" fill={isDark ? '#9d174d' : '#fda4af'} fillOpacity={isDark ? '0.66' : '0.85'} />
              <circle cx="295" cy="354" r="36" fill={isDark ? '#be185d' : '#fbcfe8'} fillOpacity={isDark ? '0.64' : '0.88'} />
              <circle cx="250" cy="360" r="28" fill={isDark ? '#f472b6' : '#ffe4e6'} fillOpacity={isDark ? '0.55' : '0.84'} />
            </g>
          </g>

          {/* ── Secondary Out-of-Phase Swaying Boughs & Hanging Glowing Lanterns ── */}
          <g className="animate-bough-sway-alt">
            {/* Soft floating blossom cluster */}
            <circle cx="195" cy="184" r="32" fill={isDark ? '#f472b6' : '#fbcfe8'} fillOpacity={isDark ? '0.52' : '0.84'} />
            <circle cx="164" cy="176" r="24" fill={isDark ? '#fbcfe8' : '#fff1f2'} fillOpacity={isDark ? '0.48' : '0.82'} />
            <circle cx="408" cy="215" r="36" fill={isDark ? '#f9a8d4' : '#ffe4e6'} fillOpacity={isDark ? '0.45' : '0.78'} />

            {/* Crisp individual 5-petal sakura blooms tucked onto branches */}
            {[
              { x: 215, y: 150, s: 1 },
              { x: 318, y: 158, s: 1.15 },
              { x: 432, y: 128, s: 1.2 },
              { x: 525, y: 145, s: 1.1 },
              { x: 274, y: 348, s: 0.95 },
              { x: 386, y: 242, s: 1.05 },
            ].map((b, i) => (
              <g key={i} transform={`translate(${b.x}, ${b.y}) scale(${b.s})`}>
                {[0, 72, 144, 216, 288].map((deg) => (
                  <ellipse
                    key={deg}
                    cx="0"
                    cy="-7"
                    rx="3.8"
                    ry="6.5"
                    fill={isDark ? '#fbcfe8' : '#fff1f2'}
                    fillOpacity="0.92"
                    transform={`rotate(${deg})`}
                  />
                ))}
                <circle cx="0" cy="0" r="2.6" fill="#fde047" />
              </g>
            ))}

            {/* Hanging Warm Paper Lantern #1 */}
            <g transform="translate(310, 358)">
              <circle cx="0" cy="28" r="36" fill="url(#lanternWarmGlow)" opacity={isDark ? '0.88' : '0.55'} />
              <line x1="0" y1="-12" x2="0" y2="10" stroke={isDark ? '#cbd5e1' : '#573c44'} strokeWidth="1.6" />
              <rect x="-9" y="10" width="18" height="24" rx="8" fill={isDark ? '#fbbf24' : '#fb7185'} />
              <rect x="-6" y="13" width="12" height="18" rx="6" fill="#fef08a" fillOpacity={isDark ? '0.9' : '0.7'} />
              <rect x="-6" y="9" width="12" height="3" rx="1" fill="#4a2e35" />
              <rect x="-5" y="33" width="10" height="3" rx="1" fill="#4a2e35" />
              <line x1="0" y1="36" x2="0" y2="44" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Hanging Warm Paper Lantern #2 */}
            <g transform="translate(210, 186)">
              <circle cx="0" cy="24" r="30" fill="url(#lanternWarmGlow)" opacity={isDark ? '0.82' : '0.48'} />
              <line x1="0" y1="-8" x2="0" y2="8" stroke={isDark ? '#cbd5e1' : '#573c44'} strokeWidth="1.5" />
              <rect x="-7.5" y="8" width="15" height="20" rx="7" fill={isDark ? '#fb923c' : '#f472b6'} />
              <rect x="-4.5" y="11" width="9" height="14" rx="4.5" fill="#fef08a" fillOpacity={isDark ? '0.88' : '0.72'} />
              <rect x="-5" y="7" width="10" height="2.5" rx="1" fill="#4a2e35" />
              <rect x="-4" y="27" width="8" height="2.5" rx="1" fill="#4a2e35" />
            </g>
          </g>
        </svg>
      </div>

      {/* ─── Luminous Fireflies / Blossom Dust Floating Around Canopy & Hills ─── */}
      {CANOPY_FIREFLIES.map((f) => (
        <div
          key={f.id}
          className="absolute rounded-full animate-firefly-drift"
          style={{
            ...(f.right ? { right: f.right } : { left: f.left }),
            bottom: f.bottom,
            width: `${f.size}px`,
            height: `${f.size}px`,
            animationDelay: f.delay,
            animationDuration: f.duration,
            background: isDark
              ? 'radial-gradient(circle, #fef08a 0%, #f472b6 55%, transparent 100%)'
              : 'radial-gradient(circle, #ffffff 0%, #fde047 65%, transparent 100%)',
            boxShadow: isDark
              ? '0 0 14px 4px rgba(253, 224, 71, 0.55)'
              : '0 0 10px 3px rgba(251, 191, 36, 0.4)',
          }}
        />
      ))}

      {/* ─── Wind-Swept Cherry Blossom Petal Shower (28 Multi-Depth Petals) ─── */}
      {SAKURA_PETALS.map((p) => (
        <div
          key={p.id}
          className={`absolute top-0 ${p.kind === 'wide' ? 'animate-sakura-fall-wide' : 'animate-sakura-fall'}`}
          style={{
            right: p.right,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        >
          <svg
            width={p.size}
            height={p.size}
            viewBox="0 0 24 24"
            fill="none"
            style={{ opacity: isDark ? Math.min(0.95, p.opacity) : p.opacity }}
          >
            {/* Classic notched cherry blossom petal silhouette */}
            <path
              d="M12 2 C15.2 4.5, 18.8 8.8, 17.5 14.2 C16.5 18.4, 13.6 21.2, 12 21.8 C10.4 21.2, 7.5 18.4, 6.5 14.2 C5.2 8.8, 8.8 4.5, 12 2 Z"
              fill={palette[p.tone]}
            />
            {/* Delicate petal notch & inner blush gradient */}
            <path
              d="M12 2 L10.7 5.2 L12 4.2 L13.3 5.2 Z"
              fill={isDark ? '#1e1b4b' : '#ffffff'}
              fillOpacity="0.4"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default SakuraTreeBackdrop;
