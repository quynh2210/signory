import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

export const WordArrangementQuestion = ({ question, onAnswer, disabled }) => {
  const { playClick } = useSound();
  
  // Prepare bank of words
  const [bank, setBank] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const allWords = [
      ...(question.words || []),
      ...(question.distractorWords || [])
    ];
    // Shuffle words deterministically for display
    const shuffled = allWords
      .map((w, idx) => ({ id: `word-${idx}-${w}`, text: w }))
      .sort(() => 0.5 - Math.random());
    setBank(shuffled);
    setSelectedWords([]);
    setHasChecked(false);
  }, [question]);

  const handlePickWord = (wordObj) => {
    if (disabled || hasChecked) return;
    playClick();
    setBank(prev => prev.filter(w => w.id !== wordObj.id));
    setSelectedWords(prev => [...prev, wordObj]);
  };

  const handleRemoveWord = (wordObj) => {
    if (disabled || hasChecked) return;
    playClick();
    setSelectedWords(prev => prev.filter(w => w.id !== wordObj.id));
    setBank(prev => [...prev, wordObj]);
  };

  const handleCheck = () => {
    if (disabled || selectedWords.length === 0) return;
    setHasChecked(true);
    const formed = selectedWords.map(w => w.text.trim().toUpperCase());
    const target = (question.correctSequence || question.words || []).map(w => w.trim().toUpperCase());
    const isCorrect = formed.join(' ') === target.join(' ');
    onAnswer(isCorrect);
  };

  const handleReset = () => {
    if (disabled) return;
    playClick();
    const all = [...bank, ...selectedWords];
    setBank(all);
    setSelectedWords([]);
    setHasChecked(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl md:text-2xl font-black text-slate-800">
          {question.questionTitle || 'Sắp xếp các từ theo đúng thứ tự'}
        </h3>
        {question.questionText && (
          <p className="text-slate-600 text-base md:text-lg">
            {question.questionText}
          </p>
        )}
      </div>

      {/* Answer Slots Area */}
      <div className="min-h-[90px] p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-wrap gap-2.5 items-center justify-center transition-colors">
        {selectedWords.length === 0 ? (
          <span className="text-slate-400 font-medium text-sm md:text-base select-none">
            Chạm vào các ô từ bên dưới để ghép câu...
          </span>
        ) : (
          selectedWords.map((w) => (
            <motion.button
              key={w.id}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={() => handleRemoveWord(w)}
              disabled={disabled}
              className="px-4 py-2.5 bg-white border-2 border-brand-500 text-brand-900 font-extrabold text-base md:text-lg rounded-xl shadow-duo hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-all"
            >
              {w.text}
            </motion.button>
          ))
        )}
      </div>

      {/* Word Bank */}
      <div className="flex flex-wrap gap-2.5 justify-center items-center py-4 min-h-[80px]">
        {bank.map((w) => (
          <motion.button
            key={w.id}
            layout
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePickWord(w)}
            disabled={disabled}
            className="px-4 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-extrabold text-base md:text-lg rounded-xl shadow-duo hover:border-brand-400 hover:bg-slate-50 transition-all"
          >
            {w.text}
          </motion.button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3">
        {selectedWords.length > 0 && !hasChecked && (
          <button
            onClick={handleReset}
            disabled={disabled}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-500 font-bold hover:bg-slate-100 flex items-center gap-1.5 transition-all text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Làm lại
          </button>
        )}
        <button
          onClick={handleCheck}
          disabled={disabled || selectedWords.length === 0}
          className="px-8 py-3 rounded-2xl font-black text-white btn-3d btn-green-3d transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          Kiểm tra đáp án
        </button>
      </div>
    </div>
  );
};

export default WordArrangementQuestion;
