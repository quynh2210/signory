import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export const FeedbackBanner = ({ 
  isCorrect, 
  feedback, 
  explanation, 
  points = 10,
  onContinue,
  isKidsMode = false 
}) => {
  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 120, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 border-t-2 shadow-2xl backdrop-blur-md ${
        isCorrect
          ? 'bg-[#d7ffb8] border-[#58cc02] text-[#2e7d04]'
          : 'bg-[#ffdfe0] border-[#ff4b4b] text-[#ea2b2b]'
      }`}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left message & explanation */}
        <div className="flex items-start gap-4 text-center sm:text-left">
          <div className={`p-2.5 rounded-2xl hidden sm:flex items-center justify-center ${
            isCorrect ? 'bg-[#58cc02] text-white' : 'bg-[#ff4b4b] text-white'
          }`}>
            {isCorrect ? (
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            ) : (
              <AlertCircle className="w-8 h-8 stroke-[2.5]" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h4 className="text-xl md:text-2xl font-black">
                {isCorrect ? (isKidsMode ? '🌟 Bé thật tuyệt vời! 🌟' : 'Chính xác! Làm tốt lắm!') : 'Chưa đúng rồi!'}
              </h4>
              {isCorrect && points > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  +{points} EXP
                </span>
              )}
            </div>

            {feedback && (
              <p className="text-sm md:text-base font-bold opacity-90">
                {feedback}
              </p>
            )}

            {!isCorrect && explanation && (
              <p className="text-xs md:text-sm font-semibold opacity-85 mt-1 bg-white/40 p-2 rounded-xl">
                💡 Giải thích: {explanation}
              </p>
            )}
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={onContinue}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 btn-3d shadow-md ${
            isCorrect
              ? 'btn-green-3d'
              : 'btn-red-3d'
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
