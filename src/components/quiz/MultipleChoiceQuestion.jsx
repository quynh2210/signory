import React, { useState } from 'react';
import { CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

export const MultipleChoiceQuestion = ({ question, onAnswer, disabled }) => {
  const [selectedId, setSelectedId] = useState(null);
  const { playClick } = useSound();

  const handleSelect = (option) => {
    if (disabled) return;
    playClick();
    setSelectedId(option.id);
    onAnswer(option.id === question.correctAnswer || option.isCorrect);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Question header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl md:text-2xl font-black text-slate-800">
          {question.questionTitle || 'Chọn đáp án chính xác'}
        </h3>
        {question.questionText && (
          <p className="text-slate-600 text-base md:text-lg">
            {question.questionText}
          </p>
        )}
      </div>

      {/* Media if present */}
      {question.questionImage && (
        <div className="flex justify-center">
          <div className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm max-w-md w-full max-h-64 bg-slate-50 flex items-center justify-center">
            <img 
              src={question.questionImage} 
              alt={question.questionTitle} 
              className="w-full h-full object-cover max-h-64"
            />
          </div>
        </div>
      )}

      {/* Options grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
        {question.answerOptions?.map((option, idx) => {
          const isSelected = selectedId === option.id;
          const letter = String.fromCharCode(65 + idx); // A, B, C, D

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option)}
              disabled={disabled}
              className={`w-full text-left p-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-between group ${
                isSelected
                  ? 'border-brand-500 bg-brand-50 text-brand-900 shadow-md ring-2 ring-brand-300'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold ${
                  isSelected ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                }`}>
                  {letter}
                </span>

                {option.imageUrl && (
                  <img 
                    src={option.imageUrl} 
                    alt={option.text} 
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                  />
                )}

                <span className="text-base md:text-lg">{option.text}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoiceQuestion;
