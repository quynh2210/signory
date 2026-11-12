import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

export const TrueFalseQuestion = ({ question, onAnswer, disabled }) => {
  const [selected, setSelected] = useState(null);
  const { playClick } = useSound();

  const handleChoose = (choice) => {
    if (disabled) return;
    playClick();
    setSelected(choice);
    const target = String(question.correctAnswer).toLowerCase();
    onAnswer(choice === target);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h3 className="text-xl md:text-2xl font-black text-slate-800">
          {question.questionTitle || 'Đúng hay Sai?'}
        </h3>
        {question.questionText && (
          <p className="text-slate-600 text-base md:text-lg">
            {question.questionText}
          </p>
        )}
      </div>

      {/* Media */}
      {question.questionImage && (
        <div className="flex justify-center">
          <div className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm max-w-sm w-full bg-slate-50">
            <img src={question.questionImage} alt="Câu hỏi" className="w-full h-48 object-cover" />
          </div>
        </div>
      )}

      {/* Choice Buttons */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <button
          onClick={() => handleChoose('true')}
          disabled={disabled}
          className={`p-6 rounded-2xl border-4 font-black text-xl flex flex-col items-center justify-center gap-3 transition-all btn-3d ${
            selected === 'true'
              ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-lg'
              : 'border-slate-200 bg-white hover:border-emerald-300 text-slate-700'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <span>ĐÚNG</span>
        </button>

        <button
          onClick={() => handleChoose('false')}
          disabled={disabled}
          className={`p-6 rounded-2xl border-4 font-black text-xl flex flex-col items-center justify-center gap-3 transition-all btn-3d ${
            selected === 'false'
              ? 'border-red-500 bg-red-50 text-red-800 shadow-lg'
              : 'border-slate-200 bg-white hover:border-red-300 text-slate-700'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <X className="w-8 h-8 stroke-[3]" />
          </div>
          <span>SAI</span>
        </button>
      </div>
    </div>
  );
};

export default TrueFalseQuestion;
