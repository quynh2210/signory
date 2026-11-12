import React, { useState, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, CheckCircle2 } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

export const VideoRecognitionQuestion = ({ question, onAnswer, disabled }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoRef = useRef(null);
  const { playClick } = useSound();

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const changeSpeed = () => {
    if (!videoRef.current) return;
    const speeds = [1, 0.75, 0.5];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackRate(nextSpeed);
  };

  const handleReplay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handleSelect = (option) => {
    if (disabled) return;
    playClick();
    setSelectedId(option.id);
    onAnswer(option.id === question.correctAnswer || option.isCorrect);
  };

  const videoUrl = question.questionVideo || question.mediaUrl;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h3 className="text-xl md:text-2xl font-black text-slate-800">
          {question.questionTitle || 'Nhận diện ký hiệu qua video'}
        </h3>
        {question.questionText && (
          <p className="text-slate-600 text-base md:text-lg">
            {question.questionText}
          </p>
        )}
      </div>

      {/* Video Player Card */}
      <div className="rounded-3xl overflow-hidden border-2 border-slate-200 shadow-md bg-black relative group max-w-lg mx-auto">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video object-cover"
          playsInline
          loop
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Video Overlay Controls */}
        <div className="p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
              title={isPlaying ? 'Tạm dừng' : 'Phát video'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={handleReplay}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
              title="Xem lại từ đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={changeSpeed}
              className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm font-bold text-xs transition-all flex items-center gap-1"
              title="Tốc độ phát chậm"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{playbackRate}x</span>
            </button>
          </div>
        </div>

        {/* Disclaimer Tag */}
        <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[11px] font-semibold text-amber-300">
          Video minh họa
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
        {question.answerOptions?.map((option, idx) => {
          const isSelected = selectedId === option.id;
          const letter = String.fromCharCode(65 + idx);

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
                <span className="text-base md:text-lg">{option.text}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VideoRecognitionQuestion;
