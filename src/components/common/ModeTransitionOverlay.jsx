import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KIDS_WORDS_LINE1 = ['Chào', 'bé', 'nhé!'];
const KIDS_WORDS_LINE2 = ['Chúng', 'ta', 'bắt', 'đầu', 'nào!'];

export const ModeTransitionOverlay = ({ mode = 'parents', onComplete }) => {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReduced ? 1200 : 3400;

    const exitTimer = setTimeout(() => setExiting(true), duration - 550);
    const doneTimer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 250);
  };

  if (!visible) return null;

  if (mode === 'kids') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-[70] overflow-hidden flex items-center justify-center p-6 bg-gradient-to-br from-sky-200 via-purple-100 to-pink-200 dark:from-indigo-950 dark:via-purple-950 dark:to-slate-900"
        >
          {/* Comic-world floating decorations */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {/* Clouds moving outward on exit */}
            <motion.div
              animate={exiting ? { x: -120, opacity: 0 } : { x: [0, 30, 0] }}
              transition={{ duration: exiting ? 0.45 : 4, repeat: exiting ? 0 : Infinity }}
              className="absolute top-[10%] left-[6%] opacity-85"
            >
              <svg width="140" viewBox="0 0 200 90" fill="none">
                <path
                  d="M42 74h112c17.673 0 32-12.536 32-28 0-14.3-12.226-26.1-28.11-27.79C152.08 7.59 140.48 0 127 0c-16.84 0-31.02 10.75-35.84 25.56C87.17 23.92 82.72 23 78 23c-16.016 0-29 12.088-29 27 0 1.48.128 2.932.374 4.342C36.04 56.08 26 64.17 26 74h16z"
                  fill="var(--signory-cloud)"
                />
              </svg>
            </motion.div>

            <motion.div
              animate={exiting ? { x: 120, opacity: 0 } : { x: [0, -28, 0] }}
              transition={{ duration: exiting ? 0.45 : 4.5, repeat: exiting ? 0 : Infinity }}
              className="absolute top-[16%] right-[8%] opacity-80"
            >
              <svg width="160" viewBox="0 0 200 90" fill="none">
                <path
                  d="M42 74h112c17.673 0 32-12.536 32-28 0-14.3-12.226-26.1-28.11-27.79C152.08 7.59 140.48 0 127 0c-16.84 0-31.02 10.75-35.84 25.56C87.17 23.92 82.72 23 78 23c-16.016 0-29 12.088-29 27 0 1.48.128 2.932.374 4.342C36.04 56.08 26 64.17 26 74h16z"
                  fill="var(--signory-cloud)"
                />
              </svg>
            </motion.div>

            {/* Playful floating bubbles & shapes */}
            {[
              { left: '16%', bottom: '12%', size: 42, bg: 'rgba(56, 189, 248, 0.35)', delay: '0s' },
              { left: '78%', bottom: '18%', size: 54, bg: 'rgba(244, 114, 182, 0.35)', delay: '0.6s' },
              { left: '34%', bottom: '8%', size: 32, bg: 'rgba(250, 204, 21, 0.4)', delay: '1.1s' },
              { left: '62%', bottom: '10%', size: 38, bg: 'rgba(167, 139, 250, 0.38)', delay: '0.4s' },
            ].map((b, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-bubble-rise"
                style={{
                  left: b.left,
                  bottom: b.bottom,
                  width: b.size,
                  height: b.size,
                  backgroundColor: b.bg,
                  animationDelay: b.delay,
                }}
              />
            ))}

            {/* Twinkling Stars & Tiny Flowers */}
            {[
              { top: '24%', left: '22%', color: '#facc15', scale: 1.1 },
              { top: '72%', left: '15%', color: '#fb7185', scale: 1 },
              { top: '28%', right: '20%', color: '#c084fc', scale: 1.2 },
              { top: '70%', right: '18%', color: '#34d399', scale: 1 },
            ].map((st, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0, rotate: -30 }}
                animate={
                  exiting
                    ? { scale: 0, opacity: 0 }
                    : { scale: [0.9, 1.15, 0.9], rotate: [0, 12, -12, 0] }
                }
                transition={{ duration: 2.4, repeat: Infinity, delay: idx * 0.2 }}
                className="absolute"
                style={st}
              >
                <svg width="34" height="34" viewBox="0 0 24 24" fill={st.color}>
                  <path d="M12 2L14.6 8.6L21.5 9.2L16.2 13.8L17.9 20.6L12 16.9L6.1 20.6L7.8 13.8L2.5 9.2L9.4 8.6L12 2Z" />
                </svg>
              </motion.div>
            ))}
          </div>

          {/* Center Comic Typography */}
          <motion.div
            animate={exiting ? { scale: 0.92, opacity: 0 } : { scale: 1, opacity: 1 }}
            className="relative z-10 max-w-2xl text-center space-y-5"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                {KIDS_WORDS_LINE1.map((word, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ scale: 0.4, opacity: 0, y: 24 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 14, delay: idx * 0.14 }}
                    className="text-4xl sm:text-6xl font-black text-purple-700 dark:text-purple-200 drop-shadow-sm inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                {KIDS_WORDS_LINE2.map((word, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ scale: 0.4, opacity: 0, y: 24 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 14,
                      delay: 0.55 + idx * 0.12,
                    }}
                    className="text-3xl sm:text-5xl font-black text-pink-600 dark:text-pink-300 drop-shadow-sm inline-block"
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.35, duration: 0.5 }}
              className="space-y-1.5"
            >
              <p className="text-lg sm:text-xl font-black text-slate-700 dark:text-slate-100">
                Hôm nay chúng mình sẽ khám phá điều gì nhỉ?
              </p>
              <p className="text-sm sm:text-base font-bold text-purple-600 dark:text-purple-300">
                Cùng học những ký hiệu mới nhé! ✨
              </p>
            </motion.div>
          </motion.div>

          <button
            onClick={handleSkip}
            className="fixed bottom-6 right-6 z-20 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-black border border-purple-200 dark:border-purple-700 shadow-sm hover:scale-105 transition-transform"
          >
            Vào bản đồ ngay →
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }

  // PARENTS MODE: Calm cream, beige, sage green, warm golden glow
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: 0.55 }}
        className="fixed inset-0 z-[70] overflow-hidden flex items-center justify-center p-6 bg-gradient-to-br from-[#fbf7ee] via-[#f0eadc] to-[#e4ece3] dark:from-[#0f172a] dark:via-[#16201e] dark:to-[#1e2420]"
      >
        {/* Warm Soft Glow & Drifting Petals */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-3xl opacity-55 dark:opacity-25"
            style={{
              background:
                'radial-gradient(circle, rgba(251, 211, 141, 0.55) 0%, rgba(167, 201, 173, 0.25) 55%, transparent 75%)',
            }}
          />

          {[
            { left: '15%', top: '16%', delay: '0s', color: '#d4a373' },
            { left: '76%', top: '22%', delay: '0.8s', color: '#84a98c' },
            { left: '28%', top: '65%', delay: '1.3s', color: '#e9c46a' },
            { left: '66%', top: '70%', delay: '0.4s', color: '#a3b18a' },
          ].map((petal, idx) => (
            <div
              key={idx}
              className="absolute animate-wind-float"
              style={{ left: petal.left, top: petal.top, animationDelay: petal.delay }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C16.5 6 19 11 16 17C14 20.5 9.5 21 6.5 18C3.5 15 4 9.5 8 5.5C9.5 4 10.8 2.8 12 2Z"
                  fill={petal.color}
                  fillOpacity="0.55"
                />
              </svg>
            </div>
          ))}
        </div>

        {/* Calm Reflective Typography */}
        <motion.div
          animate={exiting ? { y: -10, opacity: 0 } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-xl text-center space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-block px-4 py-1.5 rounded-full bg-[#e9e3d5] dark:bg-emerald-950/60 text-[#5c5346] dark:text-emerald-200 border border-[#d6ccb8] dark:border-emerald-800/60 text-xs font-black tracking-wider uppercase"
          >
            Không gian dành cho Phụ huynh
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="text-2xl sm:text-4xl font-black text-[#433a2e] dark:text-[#f3efe6] leading-snug"
          >
            “Mỗi cử chỉ nhỏ,
            <br />
            là một cách yêu thương được sẻ chia.”
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.8 }}
            className="text-sm sm:text-base font-bold text-[#5e6b5c] dark:text-[#a8bfb0] leading-relaxed"
          >
            Cùng con học cách giao tiếp, cùng con mở ra thế giới yêu thương — chỉ 3 phút nhẹ nhàng mỗi ngày.
          </motion.p>
        </motion.div>

        <button
          onClick={handleSkip}
          className="fixed bottom-6 right-6 z-20 px-4 py-2 rounded-full bg-white/75 dark:bg-slate-800/80 text-[#433a2e] dark:text-slate-200 text-xs font-black border border-[#d6ccb8] dark:border-slate-700 shadow-sm hover:scale-105 transition-transform"
        >
          Vào bản đồ học →
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModeTransitionOverlay;
