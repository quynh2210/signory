import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const CLOUDS = [
  { id: 'ac1', top: '7%', width: 170, delay: '-6s', speed: 'animate-cloud-slow', opacityLight: 0.85, opacityDark: 0.16 },
  { id: 'ac2', top: '24%', width: 220, delay: '-24s', speed: 'animate-cloud-medium', opacityLight: 0.7, opacityDark: 0.12 },
  { id: 'ac3', top: '52%', width: 145, delay: '-15s', speed: 'animate-cloud-slow', opacityLight: 0.65, opacityDark: 0.1 },
  { id: 'ac4', top: '74%', width: 190, delay: '-32s', speed: 'animate-cloud-medium', opacityLight: 0.55, opacityDark: 0.1 },
];

const STARS = [
  { top: '8%', left: '12%', size: 14, delay: '0s' },
  { top: '14%', left: '34%', size: 10, delay: '1.1s' },
  { top: '11%', left: '58%', size: 16, delay: '0.5s' },
  { top: '22%', left: '78%', size: 12, delay: '2.0s' },
  { top: '30%', left: '18%', size: 11, delay: '1.7s' },
  { top: '38%', left: '88%', size: 15, delay: '0.9s' },
  { top: '48%', left: '8%', size: 13, delay: '2.4s' },
  { top: '62%', left: '91%', size: 12, delay: '1.3s' },
  { top: '72%', left: '24%', size: 15, delay: '0.3s' },
  { top: '80%', left: '72%', size: 11, delay: '1.9s' },
];

const PETALS_AND_LEAVES = [
  { id: 'fl1', left: '7%', top: '18%', delay: '0s', duration: '12s', kind: 'petal', color: '#fda4af' },
  { id: 'fl2', left: '22%', top: '34%', delay: '-3s', duration: '14s', kind: 'leaf', color: '#86efac' },
  { id: 'fl3', left: '46%', top: '12%', delay: '-6s', duration: '11s', kind: 'petal', color: '#fbcfe8' },
  { id: 'fl4', left: '68%', top: '28%', delay: '-2s', duration: '13s', kind: 'leaf', color: '#6ee7b7' },
  { id: 'fl5', left: '85%', top: '44%', delay: '-8s', duration: '15s', kind: 'petal', color: '#fde68a' },
  { id: 'fl6', left: '32%', top: '60%', delay: '-5s', duration: '12.5s', kind: 'leaf', color: '#a7f3d0' },
  { id: 'fl7', left: '76%', top: '70%', delay: '-1s', duration: '13.5s', kind: 'petal', color: '#f9a8d4' },
];

/**
 * Full-viewport atmospheric sky/garden backdrop with:
 * - Scroll-reactive color transitions (GPU opacity layers)
 * - Light mode: glowing Sun + multi-layer clouds
 * - Dark mode: luminous Crescent Moon + twinkling stars
 * - Animated wind-drifting flowers & leaves (+ floating books on learning maps)
 */
export const AtmosphericBackdrop = ({ variant = 'default' }) => {
  const { isDark } = useTheme();
  const { scrollYProgress } = useScroll();

  const midLayerOpacity = useTransform(scrollYProgress, [0, 0.45, 0.85], [0, 0.9, 0.35]);
  const deepLayerOpacity = useTransform(scrollYProgress, [0.35, 0.75, 1], [0, 0.65, 1]);

  const isMap = variant === 'map' || variant === 'kids' || variant === 'parents' || variant === 'story';
  const isKids = variant === 'kids';

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none"
      aria-hidden="true"
    >
      {/* ─── Base Sky Layer (Top of scroll) ─── */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark
            ? 'bg-gradient-to-b from-[#070b19] via-[#111530] to-[#0f172a]'
            : isKids
            ? 'bg-gradient-to-b from-sky-100 via-purple-50 to-pink-50'
            : 'bg-gradient-to-b from-sky-100/90 via-rose-50/75 to-amber-50/85'
        }`}
      />

      {/* ─── Mid-Scroll Dynamic Gradient Layer ─── */}
      <motion.div
        style={{ opacity: midLayerOpacity }}
        className={`absolute inset-0 ${
          isDark
            ? 'bg-gradient-to-b from-[#0b132b] via-[#1a1438] to-[#0e1c26]'
            : isKids
            ? 'bg-gradient-to-b from-purple-100/90 via-pink-50/90 to-sky-100/85'
            : 'bg-gradient-to-b from-emerald-50/95 via-sky-50/90 to-purple-100/80'
        }`}
      />

      {/* ─── Bottom-Scroll Sunset / Deep Midnight Gradient Layer ─── */}
      <motion.div
        style={{ opacity: deepLayerOpacity }}
        className={`absolute inset-0 ${
          isDark
            ? 'bg-gradient-to-b from-[#090d16] via-[#1c102e] to-[#0f172a]'
            : 'bg-gradient-to-b from-amber-100/85 via-rose-100/80 to-purple-100/80'
        }`}
      />

      {/* ─── Celestial Body: SUN (Light) vs CRESCENT MOON (Dark) ─── */}
      {!isDark ? (
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 360] }}
          transition={{
            scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 60, repeat: Infinity, ease: 'linear' },
          }}
          className="absolute top-16 right-[7%] sm:right-[10%] w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center opacity-90"
        >
          {/* Soft solar glow */}
          <div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{ background: 'radial-gradient(circle, rgba(253, 224, 71, 0.75), transparent 70%)' }}
          />
          <svg width="88" height="88" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="24" fill="#fde047" />
            <circle cx="50" cy="50" r="18" fill="#facc15" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="50"
                y1="10"
                x2="50"
                y2="20"
                stroke="#facc15"
                strokeWidth="4"
                strokeLinecap="round"
                transform={`rotate(${deg} 50 50)`}
              />
            ))}
          </svg>
        </motion.div>
      ) : (
        <motion.div
          animate={{ y: [0, -6, 0], scale: [1, 1.03, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-16 right-[7%] sm:right-[10%] w-24 h-24 flex items-center justify-center opacity-95"
        >
          {/* Lunar halo */}
          <div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{ background: 'radial-gradient(circle, rgba(254, 240, 138, 0.32), transparent 70%)' }}
          />
          <svg width="68" height="68" viewBox="0 0 80 80" fill="none">
            <path
              d="M52 14C37.64 14 26 25.64 26 40C26 54.36 37.64 66 52 66C55.9 66 59.6 65.14 62.92 63.6C51.6 61.9 42.9 52.14 42.9 40.35C42.9 28.56 51.6 18.8 62.92 17.1C59.6 15.56 55.9 14 52 14Z"
              fill="#fef08a"
            />
          </svg>
        </motion.div>
      )}

      {/* ─── Night Twinkling Stars (Dark Mode) / Soft Sunbeams Sparkles (Light Mode) ─── */}
      {STARS.map((s, idx) => (
        <div
          key={idx}
          className="absolute animate-light-pulse"
          style={{
            top: s.top,
            left: s.left,
            animationDelay: s.delay,
            opacity: isDark ? 0.9 : 0.45,
          }}
        >
          <svg
            width={s.size}
            height={s.size}
            viewBox="0 0 24 24"
            fill={isDark ? '#fef08a' : '#f59e0b'}
          >
            <path d="M12 2L14.6 8.6L21.5 9.2L16.2 13.8L17.9 20.6L12 16.9L6.1 20.6L7.8 13.8L2.5 9.2L9.4 8.6L12 2Z" />
          </svg>
        </div>
      ))}

      {/* ─── Multi-layered Drifting Clouds ─── */}
      {CLOUDS.map((c) => (
        <div
          key={c.id}
          className={`absolute left-0 ${c.speed}`}
          style={{
            top: c.top,
            animationDelay: c.delay,
            opacity: isDark ? c.opacityDark : c.opacityLight,
          }}
        >
          <svg width={c.width} viewBox="0 0 200 90" fill="none">
            <path
              d="M42 74h112c17.673 0 32-12.536 32-28 0-14.3-12.226-26.1-28.11-27.79C152.08 7.59 140.48 0 127 0c-16.84 0-31.02 10.75-35.84 25.56C87.17 23.92 82.72 23 78 23c-16.016 0-29 12.088-29 27 0 1.48.128 2.932.374 4.342C36.04 56.08 26 64.17 26 74h16z"
              fill={isDark ? '#cbd5e1' : '#ffffff'}
            />
          </svg>
        </div>
      ))}

      {/* ─── Wind-Drifting Petals & Leaves ─── */}
      {PETALS_AND_LEAVES.map((item) => (
        <div
          key={item.id}
          className="absolute animate-wind-float"
          style={{
            left: item.left,
            top: item.top,
            animationDelay: item.delay,
            animationDuration: item.duration,
          }}
        >
          {item.kind === 'petal' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C16.5 6 19 11 16 17C14 20.5 9.5 21 6.5 18C3.5 15 4 9.5 8 5.5C9.5 4 10.8 2.8 12 2Z"
                fill={item.color}
                fillOpacity={isDark ? '0.45' : '0.72'}
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M17 3C11 3 5 8 5 15C5 18 7 20 10 20C16 20 20 14 20 6C20 4 19 3 17 3Z"
                fill={item.color}
                fillOpacity={isDark ? '0.4' : '0.7'}
              />
              <path d="M6 19L15 10" stroke="#15803d" strokeOpacity="0.45" strokeWidth="1.5" />
            </svg>
          )}
        </div>
      ))}

      {/* ─── Extra Floating Flowers & Books for Learning Maps ─── */}
      {isMap && (
        <>
          <div
            className="absolute top-[26%] left-[5%] md:left-[9%] animate-card-levitate opacity-85"
            style={{ animationDelay: '0.4s' }}
          >
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
          </div>

          <div
            className="absolute top-[42%] right-[6%] md:right-[10%] animate-card-levitate opacity-85"
            style={{ animationDelay: '1.2s' }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="5.5" r="3.5" fill={isKids ? '#f472b6' : '#fb7185'} />
              <circle cx="18.5" cy="12" r="3.5" fill={isKids ? '#f472b6' : '#fb7185'} />
              <circle cx="12" cy="18.5" r="3.5" fill={isKids ? '#f472b6' : '#fb7185'} />
              <circle cx="5.5" cy="12" r="3.5" fill={isKids ? '#f472b6' : '#fb7185'} />
              <circle cx="12" cy="12" r="3" fill="#facc15" />
            </svg>
          </div>

          <div
            className="absolute bottom-[20%] left-[6%] md:left-[12%] animate-card-levitate opacity-85"
            style={{ animationDelay: '2.1s' }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="5.5" r="3.2" fill="#a78bfa" />
              <circle cx="18.5" cy="12" r="3.2" fill="#a78bfa" />
              <circle cx="12" cy="18.5" r="3.2" fill="#a78bfa" />
              <circle cx="5.5" cy="12" r="3.2" fill="#a78bfa" />
              <circle cx="12" cy="12" r="2.8" fill="#fde047" />
            </svg>
          </div>

          <div
            className="absolute bottom-[24%] right-[7%] md:right-[12%] animate-card-levitate opacity-85"
            style={{ animationDelay: '1.7s' }}
          >
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
          </div>
        </>
      )}
    </div>
  );
};

export default AtmosphericBackdrop;
