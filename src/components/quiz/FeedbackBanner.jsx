import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, ArrowRight, Sparkles, Star } from 'lucide-react';

export const FeedbackBanner = ({
  isCorrect,
  feedback,
  explanation,
  points = 10,
  onContinue,
  isKidsMode = false,
}) => {
  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 120, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 border-t-2 shadow-2xl backdrop-blur-md overflow-hidden ${
        isCorrect
          ? 'bg-[#d7ffb8] dark:bg-emerald-950/95 border-[#58cc02] dark:border-emerald-500 text-[#2e7d04] dark:text-emerald-100'
          : 'bg-[#ffdfe0] dark:bg-rose-950/95 border-[#ff4b4b] dark:border-rose-500 text-[#ea2b2b] dark:text-rose-100'
      }`}
    >
      {/* Popping celebratory stars on correct answer (Section 6.6) */}
      {isCorrect && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {[
            { left: '8%', top: '18%', delay: 0.05 },
            { left: '22%', top: '10%', delay: 0.14 },
            { right: '18%', top: '15%', delay: 0.1 },
            { right: '7%', top: '24%', delay: 0.2 },
          ].map((pos, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, y: 12, opacity: 0 }}
              animate={{ scale: [0, 1.35, 1], y: [12, -8, -4], opacity: [0, 1, 0] }}
              transition={{ duration: 0.95, delay: pos.delay }}
              className="absolute"
              style={pos}
            >
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </motion.div>
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left message & explanation */}
        <div className="flex items-start gap-4 text-center sm:text-left">
          <motion.div
            initial={isCorrect ? { scale: 0.5, rotate: -15 } : { x: -6 }}
            animate={isCorrect ? { scale: [0.5, 1.15, 1], rotate: 0 } : { x: [0, -6, 6, 0] }}
            transition={{ duration: 0.35 }}
            className={`p-2.5 rounded-2xl hidden sm:flex items-center justify-center shrink-0 ${
              isCorrect ? 'bg-[#58cc02] text-white shadow-md' : 'bg-[#ff4b4b] text-white'
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            ) : (
              <AlertCircle className="w-8 h-8 stroke-[2.5]" />
            )}
          </motion.div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
              <h4 className="text-xl md:text-2xl font-black">
                {isCorrect
                  ? isKidsMode
                    ? '🌟 Bé thật tuyệt vời! 🌟'
                    : 'Chính xác! Làm tốt lắm!'
                  : 'Chưa đúng rồi!'}
              </h4>
              {isCorrect && points > 0 && (
                <motion.span
                  initial={{ scale: 0.6 }}
                  animate={{ scale: [0.6, 1.15, 1] }}
                  className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white flex items-center gap-1 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />+{points} EXP
                </motion.span>
              )}
            </div>

            {feedback && (
              <p className="text-sm md:text-base font-bold opacity-95">{feedback}</p>
            )}

            {!isCorrect && explanation && (
              <p className="text-xs md:text-sm font-semibold opacity-95 mt-1 bg-white/60 dark:bg-black/30 p-2 rounded-xl">
                💡 Giải thích: {explanation}
              </p>
            )}
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 btn-3d shadow-md shrink-0 ${
            isCorrect ? 'btn-green-3d' : 'btn-red-3d'
          }`}
        >
          <span>Tiếp tục</span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </motion.div>
  );
};

export default FeedbackBanner;
