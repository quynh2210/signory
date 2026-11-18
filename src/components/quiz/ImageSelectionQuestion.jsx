import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Heart } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

export const ImageSelectionQuestion = ({ 
  question, 
  onAnswer, 
  disabled, 
  isKidsMode = false 
}) => {
  const [selectedId, setSelectedId] = useState(null);
  const [showSpelling, setShowSpelling] = useState(false);
  const { playClick, playLetter } = useSound();

  const handleSelect = (option) => {
    if (disabled) return;
    playClick();
    setSelectedId(option.id);

    const isCorrect = option.id === question.correctAnswer || option.isCorrect;

    if (isCorrect && question.letters && question.letters.length > 0) {
      setShowSpelling(true);
      // Play sequential letter sounds
      question.letters.forEach((_, idx) => {
        setTimeout(() => {
          playLetter(idx * 2);
        }, (idx + 1) * 300);
      });
    }

    // Call onAnswer immediately so the unified FeedbackBanner appears right away
    onAnswer(isCorrect);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Title / Question */}
      <div className="text-center space-y-2">
        <h3 className={`font-black ${isKidsMode ? 'text-2xl md:text-3xl text-duo-purpleDark' : 'text-xl md:text-2xl text-slate-800'}`}>
          {question.questionTitle || 'Chọn hình ảnh đúng'}
        </h3>
        {question.questionText && (
          <p className={`${isKidsMode ? 'text-lg md:text-xl text-slate-700 font-bold' : 'text-slate-600'}`}>
            {question.questionText}
          </p>
        )}
      </div>

      {/* Demonstration image/video if provided */}
      {(question.questionImage || question.questionVideo) && (() => {
        const mediaUrl = question.questionVideo || question.questionImage;
        const isVideo = mediaUrl.match(/\.(mp4|webm|mov|ogg)($|\?)/i) || mediaUrl.includes('/video/upload/');
        return (
          <div className="flex justify-center">
            <div className="rounded-3xl overflow-hidden border-4 border-yellow-300 shadow-md max-w-xs w-full bg-white p-2">
              {isVideo ? (
                <video 
                  src={mediaUrl} 
                  controls 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-48 object-cover rounded-2xl bg-black"
                />
              ) : (
                <img 
                  src={mediaUrl} 
                  alt="Minh họa ký hiệu" 
                  className="w-full h-48 object-cover rounded-2xl"
                />
              )}
            </div>
          </div>
        );
      })()}

      {/* 4 Image Choices Grid */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 pt-2">
        {question.answerOptions?.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <motion.button
              key={option.id}
              whileHover={{ scale: disabled ? 1 : 1.03 }}
              whileTap={{ scale: disabled ? 1 : 0.97 }}
              onClick={() => handleSelect(option)}
              disabled={disabled}
              className={`relative flex flex-col items-center p-3 md:p-4 rounded-3xl border-4 transition-all text-center group ${
                isSelected
                  ? 'border-brand-500 bg-emerald-50 shadow-lg scale-102 ring-4 ring-emerald-200'
                  : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-md'
              }`}
            >
              <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 bg-slate-100 flex items-center justify-center">
                <img 
                  src={option.imageUrl} 
                  alt={option.label || 'Hình ảnh'} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <span className={`font-black ${isKidsMode ? 'text-lg md:text-2xl text-slate-800' : 'text-base font-bold text-slate-700'}`}>
                {option.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Letter-by-letter spelling breakdown for Kids Mode */}
      <AnimatePresence>
        {showSpelling && question.letters && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-gradient-to-r from-yellow-100 via-orange-100 to-pink-100 rounded-3xl border-4 border-yellow-400 text-center shadow-lg space-y-3"
          >
            <div className="flex items-center justify-center gap-2 text-duo-orangeDark font-black text-lg">
              <Sparkles className="w-5 h-5 animate-spin text-yellow-500" />
              <span>Bé cùng đánh vần chữ:</span>
            </div>

            <div className="flex items-center justify-center gap-2.5 md:gap-4 flex-wrap">
              {question.letters.map((letter, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: [0, 1.3, 1], rotate: 0 }}
                  transition={{ delay: idx * 0.3, duration: 0.4 }}
                  className="w-12 h-14 md:w-16 md:h-18 bg-white rounded-2xl shadow-duo border-b-4 border-yellow-500 flex items-center justify-center text-2xl md:text-4xl font-black text-duo-purpleDark"
                >
                  {letter}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageSelectionQuestion;
