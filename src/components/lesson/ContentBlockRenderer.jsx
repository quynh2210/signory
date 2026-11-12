import React, { useRef, useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, Volume2, Info, BookOpen } from 'lucide-react';

export const ContentBlockRenderer = ({ block }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const videoRef = useRef(null);

  if (!block) return null;

  switch (block.type) {
    case 'text':
      return (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-slate-100 shadow-sm space-y-4">
          {block.content?.title && (
            <h3 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-brand-500" />
              <span>{block.content.title}</span>
            </h3>
          )}
          {block.content?.body && (
            <p className="text-slate-600 text-base md:text-lg leading-relaxed whitespace-pre-line">
              {block.content.body}
            </p>
          )}
          {block.content?.tip && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-amber-900 text-sm md:text-base font-medium">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Mẹo từ truyện tranh: </strong>
                <span>{block.content.tip}</span>
              </div>
            </div>
          )}
        </div>
      );

    case 'image':
      return (
        <div className="bg-white rounded-3xl p-4 md:p-6 border-2 border-slate-100 shadow-sm space-y-3 text-center">
          {block.content?.title && (
            <h4 className="text-lg font-black text-slate-800">{block.content.title}</h4>
          )}
          <div className="rounded-2xl overflow-hidden border border-slate-200 max-w-lg mx-auto bg-slate-50">
            <img 
              src={block.content?.mediaUrl || block.content?.imageUrl} 
              alt={block.content?.title || 'Hình ảnh'} 
              className="w-full h-auto max-h-80 object-cover"
            />
          </div>
          {block.content?.caption && (
            <p className="text-sm text-slate-500 italic">{block.content.caption}</p>
          )}
        </div>
      );

    case 'video':
      const toggleVideo = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          videoRef.current.play();
          setIsPlaying(true);
        }
      };

      const cycleSpeed = () => {
        if (!videoRef.current) return;
        const speeds = [1, 0.75, 0.5];
        const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
        videoRef.current.playbackRate = next;
        setSpeed(next);
      };

      const restartVideo = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        setIsPlaying(true);
      };

      return (
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm space-y-4">
          <div className="space-y-1">
            <h4 className="text-xl font-black text-slate-800">{block.content?.title || 'Xem ký hiệu'}</h4>
            {block.content?.description && (
              <p className="text-slate-600 text-sm md:text-base">{block.content.description}</p>
            )}
          </div>

          <div className="rounded-3xl overflow-hidden border-2 border-slate-200 shadow-md bg-black relative group max-w-xl mx-auto">
            <video
              ref={videoRef}
              src={block.content?.mediaUrl}
              poster={block.content?.posterUrl}
              className="w-full aspect-video object-cover"
              playsInline
              loop
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Video Controls */}
            <div className="p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleVideo}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button
                  onClick={restartVideo}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={cycleSpeed}
                className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm font-bold text-xs flex items-center gap-1 transition-all"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{speed}x (Chậm)</span>
              </button>
            </div>

            {block.content?.disclaimer && (
              <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[11px] font-semibold text-amber-300">
                Minh họa mẫu
              </div>
            )}
          </div>

          {block.content?.disclaimer && (
            <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              📌 {block.content.disclaimer}
            </p>
          )}
        </div>
      );

    case 'audio':
      return (
        <div className="bg-white rounded-3xl p-4 md:p-6 border-2 border-slate-100 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-slate-800">{block.content?.title || 'Phát âm thanh'}</h5>
              <p className="text-xs text-slate-500">{block.content?.description || 'Nghe hướng dẫn'}</p>
            </div>
          </div>
          <audio controls src={block.content?.mediaUrl} className="h-10" />
        </div>
      );

    default:
      return null;
  }
};

export default ContentBlockRenderer;
