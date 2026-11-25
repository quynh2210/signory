import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Star, Trophy, RotateCcw, Award, ArrowRight, Sparkles } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

export const LessonCompletionModal = ({
  stars = 3,
  score: _score = 100,
  xpGained = 50,
  correctCount = 3,
  totalQuestions = 3,
  newBadges = [],
  onReturnToMap,
  onReplay,
  isKidsMode = false,
}) => {
  const { playComplete, playBadge } = useSound();

  useEffect(() => {
    playComplete();

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReduced) {
      const end = Date.now() + 2.2 * 1000;
      const colors = isKidsMode
        ? ['#58cc02', '#ffc800', '#1cb0f6', '#ff4b4b', '#ce82ff']
        : ['#58cc02', '#d4a373', '#84a98c', '#fbbf24'];

      (function frame() {
        confetti({
          particleCount: isKidsMode ? 4 : 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: isKidsMode ? 4 : 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }

    if (newBadges.length > 0) {
      setTimeout(() => {
        playBadge();
      }, 1200);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.82, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 280 }}
        className={`rounded-[32px] p-6 md:p-10 max-w-lg w-full text-center shadow-2xl border-4 space-y-6 relative overflow-hidden ${
          isKidsMode
            ? 'bg-white dark:bg-slate-800 border-purple-300 dark:border-purple-600'
            : 'bg-[#fffdf8] dark:bg-slate-800 border-amber-300 dark:border-emerald-700'
        }`}
      >
        {/* Expanding soft celebratory light ring + rising stars */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0.7 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className={`pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-4 ${
            isKidsMode ? 'border-purple-300/60' : 'border-amber-300/50'
          }`}
        />

        {/* Header Ribbon / Title */}
        <div className="space-y-2 relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.18, type: 'spring' }}
            className={`w-20 h-20 mx-auto rounded-3xl text-white flex items-center justify-center shadow-duo ${
              isKidsMode
                ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                : 'bg-gradient-to-br from-amber-400 to-emerald-500'
            }`}
          >
            <Trophy className="w-12 h-12 stroke-[2.5]" />
          </motion.div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">
            {isKidsMode ? '🎉 Bé Giỏi Quá Đi Thôi! 🎉' : 'Chúc Mừng Hoàn Thành!'}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 font-bold text-sm md:text-base">
            {isKidsMode
              ? 'Bé đã nhớ được các ký hiệu và chữ cái thật xuất sắc!'
              : 'Mỗi bài học nhỏ hôm nay là một nhịp cầu yêu thương cùng con.'}
          </p>
        </div>

        {/* Stars Display (1 - 3 stars) */}
        <div className="flex items-center justify-center gap-3 py-2 relative z-10">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars;
            return (
              <motion.div
                key={starIdx}
                initial={{ scale: 0, rotate: -40, y: 15 }}
                animate={{ scale: 1, rotate: 0, y: 0 }}
                transition={{ delay: 0.28 + starIdx * 0.18, type: 'spring' }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-duo transition-all ${
                  isEarned
                    ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 text-white border-2 border-yellow-300 ring-4 ring-yellow-200 dark:ring-yellow-700/40'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-600'
                }`}
              >
                <Star className="w-10 h-10 fill-current" />
              </motion.div>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl p-3.5 border-2 border-emerald-200 dark:border-emerald-700 text-center"
          >
            <span className="text-xs uppercase font-extrabold text-emerald-600 dark:text-emerald-300 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Điểm thưởng EXP
            </span>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-200">+{xpGained}</p>
          </motion.div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="bg-sky-50 dark:bg-sky-950/60 rounded-2xl p-3.5 border-2 border-sky-200 dark:border-sky-700 text-center"
          >
            <span className="text-xs uppercase font-extrabold text-sky-600 dark:text-sky-300">
              Trả lời đúng
            </span>
            <p className="text-2xl font-black text-sky-700 dark:text-sky-200">
              {correctCount} / {totalQuestions}
            </p>
          </motion.div>
        </div>

        {/* Unlocked Badges Showcase */}
        {newBadges.length > 0 && (
          <div className="bg-purple-50 dark:bg-purple-950/60 p-4 rounded-2xl border-2 border-purple-200 dark:border-purple-700 text-left space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-black text-sm">
              <Award className="w-5 h-5" />
              <span>Huy hiệu mới đạt được!</span>
            </div>
            {newBadges.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-purple-100 dark:border-purple-700"
              >
                <img src={b.imageUrl} alt={b.name} className="w-8 h-8 object-contain" />
                <div>
                  <h6 className="font-bold text-slate-800 dark:text-white text-sm">{b.name}</h6>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 relative z-10">
          <button
            onClick={onReplay}
            className="flex-1 py-3.5 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-extrabold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 btn-3d"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Học lại</span>
          </button>

          <button
            onClick={onReturnToMap}
            className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-white btn-3d transition-all flex items-center justify-center gap-2 ${
              isKidsMode ? 'btn-purple-3d' : 'btn-green-3d'
            }`}
          >
            <span>{isKidsMode ? 'Chơi tiếp' : 'Về bản đồ'}</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LessonCompletionModal;
