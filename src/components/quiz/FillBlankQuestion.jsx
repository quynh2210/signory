import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

export const FillBlankQuestion = ({ question, onAnswer, disabled }) => {
  const [inputText, setInputText] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { playClick } = useSound();

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (disabled || !inputText.trim() || hasSubmitted) return;
    setHasSubmitted(true);

    const cleanInput = inputText.trim().toLowerCase();
    const cleanTarget = String(question.correctAnswer || '').trim().toLowerCase();
    const acceptedAnswers = (question.acceptedAnswers || [cleanTarget]).map(a => a.toLowerCase().trim());

    const isCorrect = acceptedAnswers.includes(cleanInput);
    onAnswer(isCorrect);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl md:text-2xl font-black text-slate-800">
          {question.questionTitle || 'Điền từ còn thiếu vào chỗ trống'}
        </h3>
        {question.questionText && (
          <p className="text-slate-600 text-base md:text-lg">
            {question.questionText}
          </p>
        )}
      </div>

      {question.questionImage && (
        <div className="flex justify-center">
          <div className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm max-w-sm w-full bg-slate-50">
            <img src={question.questionImage} alt="Câu hỏi" className="w-full h-48 object-cover" />
          </div>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={disabled || hasSubmitted}
            placeholder="Nhập câu trả lời của bạn..."
            className="w-full px-5 py-4 text-lg md:text-xl font-bold rounded-2xl border-2 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all shadow-sm bg-white"
            autoFocus
          />
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={disabled || !inputText.trim() || hasSubmitted}
            className="px-8 py-3 rounded-2xl font-black text-white btn-3d btn-green-3d transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            Kiểm tra đáp án
          </button>
        </div>
      </form>
    </div>
  );
};

export default FillBlankQuestion;
