import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Star, Trophy, RotateCcw, MapPin, Award, ArrowRight } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

export const LessonCompletionModal = ({
  stars = 3,
  score = 100,
  xpGained = 50,
  correctCount = 3,
  totalQuestions = 3,
  newBadges = [],
  onReturnToMap,
  onReplay,
  isKidsMode = false
}) => {
  const { playComplete, playBadge } = useSound();

  useEffect(() => {
    // Play completion fanfare
    playComplete();

    // Trigger colorful confetti celebration!
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#58cc02', '#ffc800', '#1cb0f6', '#ff4b4b', '#ce82ff'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    if (newBadges.length > 0) {
      setTimeout(() => {
        playBadge();
      }, 1200);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="bg-white rounded-[32px] p-6 md:p-10 max-w-lg w-full text-center shadow-2xl border-4 border-yellow-300 space-y-6 relative overflow-hidden"
      >
        {/* Header Ribbon / Title */}
        <div className="space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto rounded-3xl bg-yellow-400 text-white flex items-center justify-center shadow-duo"
          >
            <Trophy className="w-12 h-12 stroke-[2.5]" />
          </motion.div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-800">
            {isKidsMode ? '🎉 Bé Giỏi Quá Đi Thôi! 🎉' : 'Chúc Mừng Hoàn Thành!'}
          </h2>
          <p className="text-slate-600 font-bold text-sm md:text-base">
            {isKidsMode 
              ? 'Bé đã nhớ được các ký hiệu và chữ cái thật xuất sắc!' 
              : 'Bạn đã hoàn thành bài học và tích lũy thêm kiến thức mới.'}
          </p>
        </div>

        {/* Stars Display (1 - 3 stars) */}
        <div className="flex items-center justify-center gap-3 py-2">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars;
            return (
              <motion.div
                key={starIdx}
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + starIdx * 0.2, type: 'spring' }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-duo transition-all ${
                  isEarned
                    ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 text-white border-2 border-yellow-300 ring-4 ring-yellow-200'
                    : 'bg-slate-100 text-slate-300 border-2 border-slate-200'
                }`}
              >
                <Star className="w-10 h-10 fill-current" />
              </motion.div>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 rounded-2xl p-3.5 border-2 border-emerald-200 text-center">
            <span className="text-xs uppercase font-extrabold text-emerald-600">Điểm thưởng EXP</span>
            <p className="text-2xl font-black text-emerald-700">+{xpGained}</p>
          </div>
          <div className="bg-sky-50 rounded-2xl p-3.5 border-2 border-sky-200 text-center">
            <span className="text-xs uppercase font-extrabold text-sky-600">Trả lời đúng</span>
            <p className="text-2xl font-black text-sky-700">{correctCount} / {totalQuestions}</p>
          </div>
        </div>

        {/* Unlocked Badges Showcase */}
        {newBadges.length > 0 && (
          <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-200 text-left space-y-2">
            <div className="flex items-center gap-2 text-purple-700 font-black text-sm">
              <Award className="w-5 h-5" />
              <span>Huy hiệu mới đạt được!</span>
            </div>
            {newBadges.map((b) => (
              <div key={b.id} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-purple-100">
                <img src={b.imageUrl} alt={b.name} className="w-8 h-8 object-contain" />
                <div>
                  <h6 className="font-bold text-slate-800 text-sm">{b.name}</h6>
                  <p className="text-xs text-slate-500">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onReplay}
            className="flex-1 py-3.5 px-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-extrabold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 btn-3d"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Học lại</span>
          </button>

          <button
            onClick={onReturnToMap}
            className="flex-1 py-3.5 px-4 rounded-2xl font-black text-white btn-3d btn-green-3d transition-all flex items-center justify-center gap-2"
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
