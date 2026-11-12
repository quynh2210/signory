import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings, Loader, AlertCircle
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

/** Format seconds → M:SS */
const fmtTime = (sec) => {
  if (!isFinite(sec) || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

/** Throttle helper */
function useThrottle(fn, delay = 200) {
  const timer = useRef(null);
  return useCallback((...args) => {
    if (timer.current) return;
    timer.current = setTimeout(() => { timer.current = null; }, delay);
    fn(...args);
  }, [fn, delay]);
}

export const WatchVideoPage = () => {
  const { videoId } = useParams();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimer = useRef(null);

  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Playback state
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [buffered, setBuffered] = useState(0);

  // Load video data from Firestore or localStorage
  useEffect(() => {
    const loadVideo = async () => {
      try {
        const docRef = doc(db, 'signory_videos', videoId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setVideoData({ id: snap.id, ...snap.data() });
        } else {
          // Fallback to localStorage
          const local = JSON.parse(localStorage.getItem('signory_videos') || '[]');
          const found = local.find(v => v.id === videoId);
          if (found) setVideoData(found);
          else setNotFound(true);
        }
      } catch (e) {
        const local = JSON.parse(localStorage.getItem('signory_videos') || '[]');
        const found = local.find(v => v.id === videoId);
        if (found) setVideoData(found);
        else setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    loadVideo();
  }, [videoId]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  const handleMouseMove = useThrottle(resetControlsTimer, 200);

  useEffect(() => {
    resetControlsTimer();
    return () => clearTimeout(controlsTimer.current);
  }, [playing]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const v = videoRef.current;
      if (!v) return;
      switch (e.code) {
        case 'Space': case 'KeyK': e.preventDefault(); togglePlay(); break;
        case 'ArrowLeft': v.currentTime = Math.max(0, v.currentTime - 5); break;
        case 'ArrowRight': v.currentTime = Math.min(v.duration, v.currentTime + 5); break;
        case 'ArrowUp': e.preventDefault(); setVolume(vol => { const nv = Math.min(1, vol + 0.1); v.volume = nv; return nv; }); break;
        case 'ArrowDown': e.preventDefault(); setVolume(vol => { const nv = Math.max(0, vol - 0.1); v.volume = nv; return nv; }); break;
        case 'KeyM': setMuted(m => { v.muted = !m; return !m; }); break;
        case 'KeyF': toggleFullscreen(); break;
        default: break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Fullscreen listener
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
    resetControlsTimer();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * duration;
    resetControlsTimer();
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
    setMuted(val === 0);
  };

  const handleRateChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
    setShowSettings(false);
  };

  const skip = (seconds) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + seconds));
    resetControlsTimer();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader className="w-12 h-12 animate-spin text-white/60 mx-auto" />
          <p className="text-white/60 font-semibold">Đang tải video...</p>
        </div>
      </div>
    );
  }

  if (notFound || !videoData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4 px-6 max-w-sm">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
          <h1 className="text-white font-black text-2xl">Video không tồn tại</h1>
          <p className="text-white/50 font-semibold text-sm">
            Link QR này không hợp lệ hoặc video đã bị xóa.
          </p>
        </div>
      </div>
    );
  }

  const progressPct = duration ? (currentTime / duration) * 100 : 0;
  const bufferPct = duration ? (buffered / duration) * 100 : 0;

  const RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      {/* Video Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl bg-black select-none"
        style={{ aspectRatio: '16/9' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { if (playing) setShowControls(false); }}
        onClick={togglePlay}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoData.url}
          className="w-full h-full"
          onTimeUpdate={(e) => {
            setCurrentTime(e.target.currentTime);
            const buf = e.target.buffered;
            if (buf.length > 0) setBuffered(buf.end(buf.length - 1));
          }}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Center Play indicator */}
        {!playing && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center hover:bg-white/30 transition-all">
              <Play className="w-9 h-9 text-white fill-white ml-1" />
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

          <div className="relative px-4 pb-4 pt-10 space-y-2">
            {/* Title */}
            <p className="text-white font-black text-sm drop-shadow truncate">{videoData.title || videoData.originalFilename}</p>

            {/* Progress bar */}
            <div
              className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group"
              onClick={handleSeek}
            >
              {/* Buffer */}
              <div
                className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
                style={{ width: `${bufferPct}%` }}
              />
              {/* Progress */}
              <div
                className="absolute inset-y-0 left-0 bg-white rounded-full group-hover:bg-blue-400 transition-colors"
                style={{ width: `${progressPct}%` }}
              />
              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progressPct}% - 7px)` }}
              />
            </div>

            {/* Buttons row */}
            <div className="flex items-center justify-between gap-3">
              {/* Left controls */}
              <div className="flex items-center gap-1">
                {/* Skip back 10s */}
                <button
                  onClick={() => skip(-10)}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-all"
                  title="Tua lùi 10 giây (←)"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="p-1.5 text-white hover:text-blue-300 rounded-lg hover:bg-white/10 transition-all"
                  title={playing ? 'Tạm dừng (Space)' : 'Phát (Space)'}
                >
                  {playing
                    ? <Pause className="w-5 h-5 fill-current" />
                    : <Play className="w-5 h-5 fill-current ml-0.5" />
                  }
                </button>

                {/* Skip forward 10s */}
                <button
                  onClick={() => skip(10)}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-all"
                  title="Tua tới 10 giây (→)"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Volume */}
                <div className="flex items-center gap-1.5 group">
                  <button
                    onClick={() => {
                      const nm = !muted;
                      setMuted(nm);
                      if (videoRef.current) videoRef.current.muted = nm;
                    }}
                    className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-all"
                    title="Tắt tiếng (M)"
                  >
                    {muted || volume === 0
                      ? <VolumeX className="w-4 h-4" />
                      : <Volume2 className="w-4 h-4" />
                    }
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={muted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 accent-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Âm lượng (↑↓)"
                  />
                </div>

                {/* Time */}
                <span className="text-white/70 text-xs font-mono select-none">
                  {fmtTime(currentTime)} / {fmtTime(duration)}
                </span>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-1 relative">
                {/* Speed */}
                <button
                  onClick={() => setShowSettings(v => !v)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs font-black rounded-lg transition-all ${
                    showSettings ? 'bg-white text-black' : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title="Tốc độ phát"
                >
                  <Settings className="w-3.5 h-3.5" />
                  {playbackRate}×
                </button>

                {/* Speed dropdown */}
                {showSettings && (
                  <div className="absolute bottom-10 right-10 bg-black/90 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden min-w-[100px] z-20">
                    <p className="text-white/40 text-[10px] font-black uppercase px-3 pt-2 pb-1">Tốc độ</p>
                    {RATES.map(r => (
                      <button
                        key={r}
                        onClick={() => handleRateChange(r)}
                        className={`w-full text-left px-3 py-1.5 text-sm font-bold transition-colors ${
                          r === playbackRate
                            ? 'bg-blue-500 text-white'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                      >
                        {r === 1 ? 'Bình thường' : `${r}×`}
                      </button>
                    ))}
                  </div>
                )}

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-all"
                  title="Toàn màn hình (F)"
                >
                  {isFullscreen
                    ? <Minimize className="w-4 h-4" />
                    : <Maximize className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Below-player title area (not in fullscreen) */}
      {!isFullscreen && (
        <div className="w-full max-w-5xl px-4 py-4">
          <h1 className="text-white font-black text-lg">{videoData.title || videoData.originalFilename}</h1>
          <p className="text-white/40 text-xs font-semibold mt-1">
            Phát bởi <span className="text-white/60">SIGNORY</span>
            {videoData.duration && ` · ${fmtTime(videoData.duration)}`}
          </p>
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-4 text-xs text-white/30 font-semibold">
            <span>⌨ Space / K — Phát/Tạm dừng</span>
            <span>← → — Tua 10s</span>
            <span>↑ ↓ — Âm lượng</span>
            <span>M — Tắt tiếng</span>
            <span>F — Toàn màn hình</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WatchVideoPage;
