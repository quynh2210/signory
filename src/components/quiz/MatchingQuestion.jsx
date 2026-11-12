import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Image as ImageIcon } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

/**
 * MatchingQuestion – Nối cặp tương ứng
 * Layout: image on top (large), text as caption below image.
 * Text-only items show centred bold text.
 */
export const MatchingQuestion = ({ question, onAnswer, disabled }) => {
  const { playClick, playCorrect, playIncorrect } = useSound();

  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [failedPair, setFailedPair] = useState(null);

  useEffect(() => {
    const pairs = question.pairs || [];
    setLeftItems(pairs.map((p, idx) => ({
      id: `left-${p.id || idx}`,
      originalId: p.id || idx,
      text: p.leftText || p.left || '',
      imageUrl: p.leftImage || p.leftImageUrl || null,
    })));

    const shuffledRight = pairs
      .map((p, idx) => ({
        id: `right-${p.id || idx}`,
        originalId: p.id || idx,
        text: p.rightText || p.right || '',
        imageUrl: p.rightImage || p.rightImageUrl || null,
      }))
      .sort(() => 0.5 - Math.random());
    setRightItems(shuffledRight);

    setMatchedPairs(new Set());
    setSelectedLeft(null);
    setFailedPair(null);
  }, [question]);

  const handleSelectLeft = (item) => {
    if (disabled || matchedPairs.has(item.originalId)) return;
    playClick();
    setSelectedLeft(item);
    setFailedPair(null);
  };

  const handleSelectRight = (item) => {
    if (disabled || !selectedLeft || matchedPairs.has(item.originalId)) return;

    if (selectedLeft.originalId === item.originalId) {
      playCorrect();
      const updated = new Set(matchedPairs);
      updated.add(item.originalId);
      setMatchedPairs(updated);
      setSelectedLeft(null);

      if (updated.size === (question.pairs || []).length) {
        setTimeout(() => onAnswer(true), 500);
      }
    } else {
      playIncorrect();
      setFailedPair({ leftId: selectedLeft.id, rightId: item.id });
      setTimeout(() => { setFailedPair(null); setSelectedLeft(null); }, 700);
    }
  };

  /**
   * Render a single matching card:
   *  - Image only → big image, no caption
   *  - Image + Text → big image, text as caption below
   *  - Text only → centred bold text
   */
  const MatchCard = ({ item, isLeft }) => {
    const isMatched   = matchedPairs.has(item.originalId);
    const isSelected  = isLeft && selectedLeft?.id === item.id;
    const isFailed    = isLeft ? failedPair?.leftId === item.id : failedPair?.rightId === item.id;
    const isClickable = isLeft
      ? !disabled && !isMatched
      : !disabled && !isMatched && !!selectedLeft;

    const stateClass = isMatched
      ? 'border-emerald-400 bg-emerald-50 text-emerald-800 opacity-80 cursor-default'
      : isFailed
      ? 'border-red-400 bg-red-50 text-red-700 animate-shake'
      : isSelected
      ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-200 shadow-md'
      : isLeft
        ? 'border-slate-200 bg-white hover:border-brand-400 hover:shadow-sm text-slate-700 shadow-sm'
        : selectedLeft
          ? 'border-brand-200 bg-white hover:border-brand-500 hover:bg-brand-50 text-slate-700 shadow-sm cursor-pointer'
          : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed';

    const handleClick = isLeft
      ? () => handleSelectLeft(item)
      : () => handleSelectRight(item);

    const hasImage = !!item.imageUrl;
    const hasText  = !!item.text;

    return (
      <motion.button
        whileTap={{ scale: isClickable ? 0.97 : 1 }}
        onClick={handleClick}
        disabled={!isClickable}
        className={`w-full rounded-2xl border-2 font-bold transition-all overflow-hidden relative ${stateClass}`}
      >
        {/* Image block – full width, tall */}
        {hasImage && (
          <div className="w-full aspect-[4/3] bg-slate-100 overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.text || 'Hình ảnh'}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Text – caption below image, or centred if no image */}
        {hasText && (
          <div className={`px-3 py-2 text-center text-sm md:text-base leading-tight ${
            hasImage ? 'border-t border-current/10 bg-white/80' : 'py-4 px-4'
          }`}>
            {item.text}
          </div>
        )}

        {/* Text-only fallback icon if neither */}
        {!hasImage && !hasText && (
          <div className="py-6 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-slate-300" />
          </div>
        )}

        {/* Matched checkmark badge */}
        {isMatched && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow">
            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
          </div>
        )}
      </motion.button>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h3 className="text-xl md:text-2xl font-black text-slate-800">
          {question.questionTitle || 'Nối ký hiệu với ý nghĩa tương ứng'}
        </h3>
        {question.questionText && (
          <p className="text-slate-600 text-base md:text-lg">{question.questionText}</p>
        )}
      </div>

      {/* Columns */}
      <div className="grid grid-cols-2 gap-3 md:gap-6">
        {/* Left */}
        <div className="space-y-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">
            Cột Trái (Ký hiệu / Hình ảnh)
          </p>
          {leftItems.map((item) => (
            <MatchCard key={item.id} item={item} isLeft />
          ))}
        </div>

        {/* Right */}
        <div className="space-y-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">
            Cột Phải (Ý nghĩa / Hình ảnh)
          </p>
          {rightItems.map((item) => (
            <MatchCard key={item.id} item={item} isLeft={false} />
          ))}
        </div>
      </div>

      {/* Progress hint */}
      <p className="text-center text-xs text-slate-400 font-semibold">
        Đã ghép {matchedPairs.size} / {(question.pairs || []).length} cặp
      </p>
    </div>
  );
};

export default MatchingQuestion;
