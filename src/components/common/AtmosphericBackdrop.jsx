import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import SakuraTreeBackdrop from './SakuraTreeBackdrop';

const CLOUDS = [
  { id: 'ac1', top: '6%', width: 200, delay: '-10s', speed: 'animate-cloud-slow', flat: false, opacityLight: 0.85, opacityDark: 0.16 },
  { id: 'ac2', top: '19%', width: 250, delay: '-28s', speed: 'animate-cloud-medium', flat: true, opacityLight: 0.72, opacityDark: 0.14 },
  { id: 'ac3', top: '36%', width: 170, delay: '-19s', speed: 'animate-cloud-slow', flat: false, opacityLight: 0.68, opacityDark: 0.12 },
  { id: 'ac4', top: '54%', width: 230, delay: '-38s', speed: 'animate-cloud-medium', flat: true, opacityLight: 0.58, opacityDark: 0.1 },
  { id: 'ac5', top: '70%', width: 155, delay: '-5s', speed: 'animate-cloud-slow', flat: false, opacityLight: 0.52, opacityDark: 0.1 },
];

const STARS = [
  { top: '6%', left: '8%', size: 12, delay: '0s', dot: false },
  { top: '11%', left: '22%', size: 7, delay: '1.1s', dot: true },
  { top: '8%', left: '37%', size: 14, delay: '0.5s', dot: false },
  { top: '15%', left: '51%', size: 6, delay: '2.2s', dot: true },
  { top: '9%', left: '64%', size: 16, delay: '0.8s', dot: false },
  { top: '18%', left: '78%', size: 11, delay: '1.9s', dot: false },
  { top: '13%', left: '91%', size: 8, delay: '0.4s', dot: true },
  { top: '26%', left: '14%', size: 12, delay: '1.6s', dot: false },
  { top: '31%', left: '43%', size: 6, delay: '2.7s', dot: true },
  { top: '28%', left: '86%', size: 14, delay: '0.9s', dot: false },
  { top: '42%', left: '6%', size: 13, delay: '2.4s', dot: false },
  { top: '46%', left: '93%', size: 10, delay: '1.2s', dot: false },
  { top: '57%', left: '18%', size: 7, delay: '0.2s', dot: true },
  { top: '62%', left: '89%', size: 13, delay: '1.5s', dot: false },
  { top: '69%', left: '10%', size: 11, delay: '2.1s', dot: false },
  { top: '75%', left: '76%', size: 7, delay: '0.6s', dot: true },
];

const GLIDING_BIRDS = [
  { id: 'b1', top: '16%', size: 30, delay: '-4s', duration: '28s' },
  { id: 'b2', top: '21%', size: 22, delay: '-6.8s', duration: '28s' },
  { id: 'b3', top: '34%', size: 26, delay: '-17s', duration: '34s' },
];

const GENERAL_FLOATERS = [
  { id: 'gf1', left: '9%', delay: '-1.5s', duration: '12s', kind: 'petal', color: '#fda4af', size: 20 },
  { id: 'gf2', left: '21%', delay: '-6.2s', duration: '14s', kind: 'leaf', color: '#86efac', size: 21 },
  { id: 'gf3', left: '34%', delay: '-3.4s', duration: '11.5s', kind: 'star', color: '#fde047', size: 18 },
  { id: 'gf4', left: '49%', delay: '-8.7s', duration: '13.5s', kind: 'petal', color: '#fbcfe8', size: 22 },
  { id: 'gf5', left: '64%', delay: '-2.1s', duration: '12.8s', kind: 'leaf', color: '#6ee7b7', size: 20 },
  { id: 'gf6', left: '77%', delay: '-9.4s', duration: '14.6s', kind: 'petal', color: '#fde68a', size: 19 },
  { id: 'gf7', left: '88%', delay: '-4.9s', duration: '11.8s', kind: 'petal', color: '#f9a8d4', size: 21 },
  { id: 'gf8', left: '15%', delay: '-10.5s', duration: '15.2s', kind: 'butterfly', color: '#a78bfa', size: 22 },
  { id: 'gf9', left: '56%', delay: '-5.8s', duration: '13.8s', kind: 'star', color: '#7dd3fc', size: 17 },
  { id: 'gf10', left: '82%', delay: '-7.3s', duration: '12.4s', kind: 'leaf', color: '#a7f3d0', size: 19 },
];

const HORIZON_SPARKS = [
  { id: 'hs1', left: '7%', bottom: '20%', delay: '0s', duration: '8s', size: 7 },
  { id: 'hs2', left: '19%', bottom: '32%', delay: '-2.4s', duration: '9.5s', size: 6 },
  { id: 'hs3', left: '34%', bottom: '18%', delay: '-5.1s', duration: '8.7s', size: 8 },
  { id: 'hs4', left: '53%', bottom: '24%', delay: '-1.8s', duration: '10.2s', size: 6 },
  { id: 'hs5', left: '71%', bottom: '29%', delay: '-6.5s', duration: '9.1s', size: 7 },
  { id: 'hs6', left: '86%', bottom: '22%', delay: '-3.9s', duration: '8.4s', size: 8 },
];

const FLOATING_PROPS = [
  { id: 'fp1', pos: 'top-[22%] left-[3.5%] xl:left-[6%]', delay: '0.2s', kind: 'book' },
  { id: 'fp2', pos: 'top-[38%] right-[4%] xl:right-[7%]', delay: '1.1s', kind: 'flower' },
  { id: 'fp3', pos: 'bottom-[24%] left-[4%] xl:left-[8%]', delay: '2.0s', kind: 'butterfly' },
  { id: 'fp4', pos: 'bottom-[28%] right-[4.5%] xl:right-[8%]', delay: '1.5s', kind: 'lantern' },
  { id: 'fp5', pos: 'top-[56%] left-[2.5%] xl:left-[5%]', delay: '2.6s', kind: 'heart' },
  { id: 'fp6', pos: 'top-[62%] right-[3%] xl:right-[6%]', delay: '0.7s', kind: 'book_amber' },
];

/**
 * Full-viewport atmospheric indie-game landscape backdrop:
 * - Pronounced scroll-reactive gradient sky (Dawn -> Blossom Day -> Sunset / Starlit Aurora)
 * - Light mode: luminous radial Sun + volumetric sunbeams + multi-layer clouds
 * - Dark mode: Crescent Moon + twinkling stars + subtle shooting stars + aurora glow
 * - Multi-layered RiME / Alto-style distant mountain ridges, hills, mist & swaying foreground flora
 * - Dedicated right-corner Cherry Blossom Tree & 28 wind-blown petals on `story` & `kindness`
 * - Lightweight GPU-only mode on `lesson-*` tabs so learning stays ultra-smooth
 */
export const AtmosphericBackdrop = ({ variant = 'default' }) => {
  const { isDark } = useTheme();
  const { scrollYProgress } = useScroll();

  // Pronounced scroll-driven color transitions (GPU opacity only)
  const midLayerOpacity = useTransform(scrollYProgress, [0, 0.36, 0.72, 1], [0, 0.95, 0.45, 0.15]);
  const deepLayerOpacity = useTransform(scrollYProgress, [0.28, 0.68, 1], [0, 0.72, 1]);

  // Subtle GPU parallax on distant ridges and sun/moon
  const celestialY = useTransform(scrollYProgress, [0, 1], [0, 54]);
  const farRidgeY = useTransform(scrollYProgress, [0, 1], [0, -22]);

  const isSakuraScene = variant === 'story' || variant === 'kindness';
  const isKids = variant === 'kids' || variant === 'lesson-kids';
  const isLesson = variant === 'lesson-kids' || variant === 'lesson-parents';
  const isCircleOrLeader = variant === 'circle' || variant === 'leaderboard';
  const isMap = variant === 'map' || variant === 'kids' || variant === 'parents' || variant === 'story';

  const visibleClouds = isLesson ? CLOUDS.slice(0, 3) : CLOUDS;
  const visibleStars = isLesson ? STARS.slice(0, 8) : STARS;
  const visibleBirds = isLesson ? GLIDING_BIRDS.slice(0, 1) : GLIDING_BIRDS;
  const visibleFloaters = isSakuraScene
    ? GENERAL_FLOATERS.slice(0, 4) // SakuraTreeBackdrop already renders 28 falling petals
    : isLesson
    ? GENERAL_FLOATERS.slice(0, 5)
    : GENERAL_FLOATERS;
  const visibleProps = isSakuraScene
    ? FLOATING_PROPS.slice(0, 2)
    : isLesson
    ? FLOATING_PROPS.slice(0, 2)
    : FLOATING_PROPS;

  // Position sun/moon slightly more left on sakura tabs so it frames cleanly beside the right-corner cherry tree
  const celestialPosClass = isSakuraScene
    ? 'top-14 right-[28%] sm:right-[34%]'
    : 'top-14 right-[7%] sm:right-[11%]';

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* ─── 1. Base Sky Layer (Top of scroll: Fresh Morning / Starlit Indigo) ─── */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark
            ? isSakuraScene
              ? 'bg-gradient-to-b from-[#070a1c] via-[#17163b] to-[#27173d]'
              : 'bg-gradient-to-b from-[#060919] via-[#12173a] to-[#1e1945]'
            : isLesson
            ? isKids
              ? 'bg-gradient-to-b from-sky-100 via-purple-50 to-rose-50'
              : 'bg-gradient-to-b from-sky-100 via-amber-50/85 to-emerald-50/80'
            : isSakuraScene
            ? 'bg-gradient-to-b from-sky-200 via-rose-100 to-amber-100'
            : isKids
            ? 'bg-gradient-to-b from-sky-200/95 via-fuchsia-100/80 to-amber-100/85'
            : 'bg-gradient-to-b from-sky-200/95 via-amber-50/90 to-rose-100/85'
        }`}
      />

      {/* ─── 2. Mid-Scroll Vibrant Gradient Shift (Blossom Peach / Aurora Emerald-Violet) ─── */}
      <motion.div
        style={{ opacity: midLayerOpacity }}
        className={`absolute inset-0 ${
          isDark
            ? isSakuraScene
              ? 'bg-gradient-to-b from-[#0c1330] via-[#2b1852] to-[#3f194b]'
              : 'bg-gradient-to-b from-[#0a1736] via-[#231954] to-[#114247]'
            : isLesson
            ? isKids
              ? 'bg-gradient-to-b from-purple-100/85 via-pink-100/80 to-amber-100/80'
              : 'bg-gradient-to-b from-emerald-100/75 via-sky-100/75 to-amber-100/75'
            : isSakuraScene
            ? 'bg-gradient-to-b from-amber-100 via-pink-200/90 to-purple-200/85'
            : isKids
            ? 'bg-gradient-to-b from-violet-200/85 via-pink-200/85 to-amber-200/85'
            : 'bg-gradient-to-b from-emerald-100/90 via-amber-100/90 to-rose-200/85'
        }`}
      />

      {/* ─── 3. Deep-Scroll Sunset / Midnight Twilight Layer ─── */}
      <motion.div
        style={{ opacity: deepLayerOpacity }}
        className={`absolute inset-0 ${
          isDark
            ? isSakuraScene
              ? 'bg-gradient-to-b from-[#0b0e24] via-[#3a124a] to-[#521647]'
              : 'bg-gradient-to-b from-[#080c1f] via-[#2b1047] to-[#172554]'
            : isLesson
            ? isKids
              ? 'bg-gradient-to-b from-pink-100/90 via-amber-100/85 to-violet-200/80'
              : 'bg-gradient-to-b from-amber-100/85 via-rose-100/80 to-indigo-100/80'
            : isSakuraScene
            ? 'bg-gradient-to-b from-orange-200/95 via-rose-300/85 to-purple-300/90'
            : 'bg-gradient-to-b from-amber-200/95 via-rose-200/90 to-violet-300/85'
        }`}
      />

      {/* ─── Dark Mode Soft Aurora / Atmospheric Nebula Band ─── */}
      {isDark && !isLesson && (
        <div
          className="absolute -top-12 left-[10%] right-[10%] h-64 rounded-full blur-3xl opacity-35"
          style={{
            background: isSakuraScene
              ? 'linear-gradient(120deg, rgba(244,114,182,0.28), rgba(167,139,250,0.25), rgba(45,212,191,0.16))'
              : 'linear-gradient(120deg, rgba(56,189,248,0.22), rgba(168,85,247,0.26), rgba(52,211,153,0.2))',
          }}
        />
      )}

      {/* ─── 4. Celestial Orb: Volumetric Sun (Light) vs Luminous Crescent Moon (Dark) ─── */}
      <motion.div style={{ y: celestialY }} className={`absolute ${celestialPosClass}`}>
        {!isDark ? (
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
            {/* Wide atmospheric golden corona */}
            <div
              className="absolute -inset-8 rounded-full blur-2xl animate-light-pulse"
              style={{
                background:
                  'radial-gradient(circle, rgba(254, 240, 138, 0.92) 0%, rgba(253, 186, 116, 0.48) 45%, transparent 72%)',
              }}
            />
            {/* Volumetric diagonal sunbeams */}
            {!isLesson && (
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 w-56 h-[55vh] animate-sunbeam-sway opacity-45"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(254, 249, 195, 0.52) 0%, rgba(253, 224, 71, 0.14) 55%, transparent 100%)',
                  clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
                }}
              />
            )}
            {/* Luminous Alto/RiME style sun disc */}
            <svg width="108" height="108" viewBox="0 0 120 120" fill="none" className="relative z-10">
              <circle cx="60" cy="60" r="38" fill="#fef08a" fillOpacity="0.45" />
              <circle cx="60" cy="60" r="28" fill="#fde047" />
              <circle cx="60" cy="60" r="21" fill="#fffbeb" fillOpacity="0.92" />
            </svg>
          </div>
        ) : (
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
            <div
              className="absolute -inset-6 rounded-full blur-2xl animate-light-pulse"
              style={{
                background:
                  'radial-gradient(circle, rgba(254, 240, 138, 0.36) 0%, rgba(196, 181, 253, 0.2) 52%, transparent 74%)',
              }}
            />
            <svg width="82" height="82" viewBox="0 0 88 88" fill="none" className="relative z-10">
              <circle cx="44" cy="44" r="34" fill="#fef9c3" fillOpacity="0.1" />
              <path
                d="M54 14C37.43 14 24 27.43 24 44C24 60.57 37.43 74 54 74C58.6 74 62.95 72.96 66.84 71.12C53.68 69.12 43.58 57.76 43.58 44.04C43.58 30.32 53.68 18.96 66.84 16.96C62.95 15.12 58.6 14 54 14Z"
                fill="#fef08a"
              />
            </svg>
          </div>
        )}
      </motion.div>

      {/* ─── 5. Twinkling Stars & Subtle Shooting Stars (Dark) / Sun Sparkles (Light) ─── */}
      {visibleStars.map((s, idx) => (
        <div
          key={idx}
          className="absolute animate-light-pulse"
          style={{
            top: s.top,
            left: s.left,
            animationDelay: s.delay,
            opacity: isDark ? 0.92 : 0.42,
          }}
        >
          {s.dot ? (
            <div
              className="rounded-full"
              style={{
                width: `${s.size}px`,
                height: `${s.size}px`,
                backgroundColor: isDark ? '#fef08a' : '#f59e0b',
                boxShadow: isDark ? '0 0 8px rgba(254, 240, 138, 0.8)' : 'none',
              }}
            />
          ) : (
            <svg
              width={s.size}
              height={s.size}
              viewBox="0 0 24 24"
              fill={isDark ? '#fef9c3' : '#f59e0b'}
            >
              <path d="M12 2L14.3 9.2L21.5 12L14.3 14.8L12 22L9.7 14.8L2.5 12L9.7 9.2L12 2Z" />
            </svg>
          )}
        </div>
      ))}

      {/* Occasional Night Shooting Stars (Dark mode) */}
      {isDark && !isLesson && (
        <>
          <div
            className="absolute top-[14%] right-[22%] w-28 h-[2px] rounded-full animate-shooting-star"
            style={{
              background: 'linear-gradient(90deg, rgba(254,240,138,0.95), transparent)',
            }}
          />
          <div
            className="absolute top-[26%] right-[48%] w-20 h-[2px] rounded-full animate-shooting-star"
            style={{
              animationDelay: '-6.5s',
              background: 'linear-gradient(90deg, rgba(244,114,182,0.85), transparent)',
            }}
          />
        </>
      )}

      {/* ─── 6. Multi-Layer Clouds (Puffy + Alto-Style Horizon Ribbons) ─── */}
      {visibleClouds.map((c) => (
        <div
          key={c.id}
          className={`absolute left-0 ${c.speed}`}
          style={{
            top: c.top,
            animationDelay: c.delay,
            opacity: isDark ? c.opacityDark : c.opacityLight,
          }}
        >
          {c.flat ? (
            <svg width={c.width} viewBox="0 0 260 56" fill="none">
              <path
                d="M18 44 H238 C248 44 254 36 248 29 C241 21 226 24 218 24 C208 10 186 2 162 5 C144 7 132 18 122 22 C108 12 88 12 76 22 C60 22 44 27 32 32 C16 32 8 39 18 44 Z"
                fill={isDark ? '#cbd5e1' : '#ffffff'}
                fillOpacity="0.88"
              />
            </svg>
          ) : (
            <svg width={c.width} viewBox="0 0 200 90" fill="none">
              <path
                d="M42 74h112c17.673 0 32-12.536 32-28 0-14.3-12.226-26.1-28.11-27.79C152.08 7.59 140.48 0 127 0c-16.84 0-31.02 10.75-35.84 25.56C87.17 23.92 82.72 23 78 23c-16.016 0-29 12.088-29 27 0 1.48.128 2.932.374 4.342C36.04 56.08 26 64.17 26 74h16z"
                fill={isDark ? '#cbd5e1' : '#ffffff'}
              />
            </svg>
          )}
        </div>
      ))}

      {/* ─── 7. Gliding Bird Flock Across Sky ─── */}
      {visibleBirds.map((bird) => (
        <div
          key={bird.id}
          className="absolute left-0 animate-bird-glide"
          style={{
            top: bird.top,
            animationDelay: bird.delay,
            animationDuration: bird.duration,
          }}
        >
          <svg
            width={bird.size}
            height={bird.size * 0.6}
            viewBox="0 0 40 24"
            fill="none"
            className="animate-wing-flap"
          >
            <path
              d="M2 16 Q11 4 20 13 Q29 4 38 16 Q29 10 20 17 Q11 10 2 16 Z"
              fill={isDark ? '#e2e8f0' : '#475569'}
              fillOpacity={isDark ? '0.68' : '0.58'}
            />
          </svg>
        </div>
      ))}

      {/* ─── 8. RiME / Alto-Inspired Multi-Layered Parallax Horizon & Ridges ─── */}
      <motion.div
        style={{ y: farRidgeY }}
        className={`absolute inset-x-0 bottom-0 ${
          isLesson ? 'h-[20vh] min-h-[120px] opacity-60' : 'h-[32vh] min-h-[190px] max-h-[340px]'
        }`}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 320"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="horizonMist" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDark ? '#6d28d9' : '#fff7ed'} stopOpacity="0" />
              <stop offset="55%" stopColor={isDark ? '#4c1d95' : '#fef3c7'} stopOpacity={isDark ? '0.26' : '0.45'} />
              <stop offset="100%" stopColor={isDark ? '#0f172a' : '#fde68a'} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Layer 1: Far Misty Mountain Silhouettes + Distant Storybook Spire/Bridge */}
          <path
            d="M0 190 L130 130 L260 172 L410 105 L560 165 L730 112 L880 158 L1045 96 L1220 148 L1350 118 L1440 155 L1440 320 L0 320 Z"
            fill={isDark ? '#27204d' : isSakuraScene ? '#e2b8d0' : '#cbd5e1'}
            fillOpacity={isDark ? '0.62' : '0.52'}
          />
          {/* Subtle distant arched bridge silhouette (RiME homage) */}
          {!isLesson && (
            <path
              d="M275 182 Q335 168 395 182 L395 210 L382 210 L382 190 Q368 182 354 190 L354 210 L342 210 L342 190 Q328 182 314 190 L314 210 L302 210 L302 190 Q288 182 275 190 Z"
              fill={isDark ? '#31285c' : isSakuraScene ? '#d9a7c7' : '#b8c4d9'}
              fillOpacity={isDark ? '0.65' : '0.55'}
            />
          )}

          {/* Layer 2: Soft Atmospheric Mist Band */}
          <rect x="0" y="130" width="1440" height="125" fill="url(#horizonMist)" />

          {/* Layer 3: Midground Rolling Hills */}
          <path
            d="M0 228 Q190 178 410 218 T860 204 T1240 225 Q1360 205 1440 222 L1440 320 L0 320 Z"
            fill={isDark ? '#1a183b' : isSakuraScene ? '#c996b8' : isKids ? '#d8b4fe' : '#a7d7b8'}
            fillOpacity={isDark ? '0.78' : '0.45'}
          />

          {/* Layer 4: Foreground Framing Ridge Silhouette */}
          <path
            d="M0 264 Q230 232 490 274 T1010 266 Q1260 242 1440 268 L1440 320 L0 320 Z"
            fill={isDark ? '#0f132b' : isSakuraScene ? '#9e6b8e' : isKids ? '#c084fc' : '#65b887'}
            fillOpacity={isDark ? '0.88' : '0.32'}
          />
        </svg>

        {/* Swaying Grass Tufts tucked at bottom edges */}
        {!isLesson && (
          <div className="absolute bottom-0 inset-x-0 flex justify-between px-4 sm:px-10 opacity-75">
            <svg width="90" height="48" viewBox="0 0 90 48" fill="none" className="animate-grass-sway">
              <path d="M12 48 Q16 20 8 4 Q18 22 22 48" fill={isDark ? '#312e81' : '#65a37d'} fillOpacity="0.7" />
              <path d="M28 48 Q38 14 44 2 Q38 22 36 48" fill={isDark ? '#312e81' : '#65a37d'} fillOpacity="0.65" />
              <path d="M52 48 Q56 26 50 14 Q60 28 60 48" fill={isDark ? '#312e81' : '#65a37d'} fillOpacity="0.55" />
            </svg>
            {!isSakuraScene && (
              <svg
                width="90"
                height="48"
                viewBox="0 0 90 48"
                fill="none"
                className="animate-grass-sway"
                style={{ animationDelay: '-1.8s' }}
              >
                <path d="M24 48 Q20 24 14 10 Q26 26 32 48" fill={isDark ? '#312e81' : '#65a37d'} fillOpacity="0.6" />
                <path d="M48 48 Q58 18 66 4 Q58 24 56 48" fill={isDark ? '#312e81' : '#65a37d'} fillOpacity="0.7" />
                <path d="M72 48 Q78 26 84 12 Q78 28 80 48" fill={isDark ? '#312e81' : '#65a37d'} fillOpacity="0.55" />
              </svg>
            )}
          </div>
        )}
      </motion.div>

      {/* ─── 9. Horizon Fireflies / Sunlit Pollen Sparks ─── */}
      {!isLesson &&
        HORIZON_SPARKS.map((sp) => (
          <div
            key={sp.id}
            className="absolute rounded-full animate-firefly-drift"
            style={{
              left: sp.left,
              bottom: sp.bottom,
              width: `${sp.size}px`,
              height: `${sp.size}px`,
              animationDelay: sp.delay,
              animationDuration: sp.duration,
              background: isDark
                ? 'radial-gradient(circle, #fef08a 0%, #38bdf8 60%, transparent 100%)'
                : 'radial-gradient(circle, #ffffff 0%, #fde047 65%, transparent 100%)',
              boxShadow: isDark
                ? '0 0 12px 3px rgba(253, 224, 71, 0.45)'
                : '0 0 8px 2px rgba(251, 191, 36, 0.32)',
            }}
          />
        ))}

      {/* ─── 10. Wind-Drifting Petals, Leaves, Stars & Butterflies ─── */}
      {visibleFloaters.map((item) => (
        <div
          key={item.id}
          className="absolute top-0 animate-wind-float"
          style={{
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
          }}
        >
          {item.kind === 'petal' && (
            <svg width={item.size} height={item.size} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C16.5 6 19 11 16 17C14 20.5 9.5 21 6.5 18C3.5 15 4 9.5 8 5.5C9.5 4 10.8 2.8 12 2Z"
                fill={item.color}
                fillOpacity={isDark ? '0.62' : '0.82'}
              />
            </svg>
          )}
          {item.kind === 'leaf' && (
            <svg width={item.size} height={item.size} viewBox="0 0 24 24" fill="none">
              <path
                d="M17 3C11 3 5 8 5 15C5 18 7 20 10 20C16 20 20 14 20 6C20 4 19 3 17 3Z"
                fill={item.color}
                fillOpacity={isDark ? '0.52' : '0.78'}
              />
              <path d="M6 19L15 10" stroke="#15803d" strokeOpacity="0.45" strokeWidth="1.5" />
            </svg>
          )}
          {item.kind === 'star' && (
            <svg width={item.size} height={item.size} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L14.6 8.6L21.5 9.2L16.2 13.8L17.9 20.6L12 16.9L6.1 20.6L7.8 13.8L2.5 9.2L9.4 8.6L12 2Z"
                fill={item.color}
                fillOpacity={isDark ? '0.7' : '0.82'}
              />
            </svg>
          )}
          {item.kind === 'butterfly' && (
            <svg width={item.size} height={item.size} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 12C9 7 3 6 3 11C3 14 7 15 10 14C7 16 5 19 8 20C10 20.5 11.5 18 12 15C12.5 18 14 20.5 16 20C19 19 17 16 14 14C17 15 21 14 21 11C21 6 15 7 12 12Z"
                fill={isKids ? '#f472b6' : item.color}
                fillOpacity={isDark ? '0.68' : '0.82'}
              />
            </svg>
          )}
        </div>
      ))}

      {/* ─── 11. Cheerful Side Props (Books, Flowers, Lanterns, Hearts) Framing the Content ─── */}
      {(isMap || variant === 'home' || isCircleOrLeader || isLesson) &&
        visibleProps.map((prop) => (
          <div
            key={prop.id}
            className={`hidden sm:block absolute ${prop.pos} animate-card-levitate opacity-85`}
            style={{ animationDelay: prop.delay }}
          >
            {prop.kind === 'book' && (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                  stroke={isKids ? '#a855f7' : '#22c55e'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                  fill={isKids ? '#f3e8ff' : '#dcfce7'}
                  stroke={isKids ? '#9333ea' : '#16a34a'}
                  strokeWidth="1.8"
                />
              </svg>
            )}
            {prop.kind === 'book_amber' && (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                  fill="#fef3c7"
                  stroke="#d97706"
                  strokeWidth="1.8"
                />
              </svg>
            )}
            {prop.kind === 'flower' && (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="5.5" r="3.5" fill={isKids ? '#f472b6' : '#fda4af'} />
                <circle cx="18.5" cy="12" r="3.5" fill={isKids ? '#f472b6' : '#fda4af'} />
                <circle cx="12" cy="18.5" r="3.5" fill={isKids ? '#f472b6' : '#fda4af'} />
                <circle cx="5.5" cy="12" r="3.5" fill={isKids ? '#f472b6' : '#fda4af'} />
                <circle cx="12" cy="12" r="3" fill="#facc15" />
              </svg>
            )}
            {prop.kind === 'butterfly' && (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 12C9 7 3 6 3 11C3 14 7 15 10 14C7 16 5 19 8 20C10 20.5 11.5 18 12 15C12.5 18 14 20.5 16 20C19 19 17 16 14 14C17 15 21 14 21 11C21 6 15 7 12 12Z"
                  fill={isDark ? '#c084fc' : '#f472b6'}
                  fillOpacity="0.82"
                />
              </svg>
            )}
            {prop.kind === 'lantern' && (
              <svg width="32" height="36" viewBox="0 0 24 28" fill="none">
                <line x1="12" y1="0" x2="12" y2="5" stroke="#b45309" strokeWidth="1.5" />
                <rect x="6" y="5" width="12" height="16" rx="5" fill="#fbbf24" fillOpacity="0.88" stroke="#d97706" strokeWidth="1.5" />
                <line x1="12" y1="21" x2="12" y2="26" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
            {prop.kind === 'heart' && (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21s-7-4.5-9.5-9C.5 8.5 2.8 4.5 6.8 4.5c2.2 0 4.1 1.1 5.2 2.9 1.1-1.8 3-2.9 5.2-2.9 4 0 6.3 4 4.3 7.5C19 16.5 12 21 12 21z"
                  fill={isDark ? '#f472b6' : '#fb7185'}
                  fillOpacity="0.72"
                />
              </svg>
            )}
          </div>
        ))}

      {/* ─── 12. Dedicated Grand Cherry Blossom Tree & Wind Petal Shower (`story` & `kindness`) ─── */}
      {isSakuraScene && <SakuraTreeBackdrop isDark={isDark} />}
    </div>
  );
};

export default AtmosphericBackdrop;
