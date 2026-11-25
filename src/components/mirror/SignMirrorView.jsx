import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Rewind,
  Gauge,
  Maximize2,
  Minimize2,
  Camera,
  CameraOff,
  Video,
  Square,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  FlipHorizontal,
  Trash2,
  Columns,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { getStorySentences, createMotionAnalysisAdapter } from '../../services/mirrorService';
import { useSound } from '../../context/SoundContext';

export const SignMirrorView = ({ story, onBackToLessons }) => {
  const { playClick, playCorrect } = useSound();

  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeSignIdx, setActiveSignIdx] = useState(0);
  const [completedFlow, setCompletedFlow] = useState(false);

  // Sample video controls
  const sampleVideoRef = useRef(null);
  const [isSamplePlaying, setIsSamplePlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isSampleExpanded, setIsSampleExpanded] = useState(false);

  // Split ratio: 'balanced' (1:1), 'sample-wide' (62:38), 'camera-wide' (38:62)
  const [splitRatio, setSplitRatio] = useState('balanced');

  // Camera & local recording states (strictly opt-in & local-only)
  const cameraVideoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [mirrorFlip, setMirrorFlip] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [showRecordConfirm, setShowRecordConfirm] = useState(false);

  // Extensible motion adapter hook (visual comparison in v1)
  const motionAdapter = React.useMemo(() => createMotionAnalysisAdapter(), []);

  useEffect(() => {
    let active = true;
    getStorySentences(story?.id).then((list) => {
      if (!active) return;
      setSentences(list);
      setCurrentIndex(0);
      setActiveSignIdx(0);
      setCompletedFlow(false);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [story?.id]);

  // Stop camera cleanly on unmount
  const stopCamera = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try {
        recorderRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
    setIsRecording(false);
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  // Re-attach live stream whenever cameraActive or recordedUrl toggles
  useEffect(() => {
    if (cameraActive && !recordedUrl && cameraVideoRef.current && streamRef.current) {
      cameraVideoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive, recordedUrl]);

  const currentSentence = sentences[currentIndex];
  const currentSigns = currentSentence?.signVideos || [];
  const activeSign = currentSigns[activeSignIdx] || currentSigns[0] || null;

  // Apply playback rate when sign or speed changes
  useEffect(() => {
    if (sampleVideoRef.current) {
      sampleVideoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, activeSign?.videoUrl, currentIndex]);

  const handleToggleSamplePlay = () => {
    if (!sampleVideoRef.current) return;
    playClick();
    if (sampleVideoRef.current.paused) {
      sampleVideoRef.current.play().catch(() => {});
      setIsSamplePlaying(true);
    } else {
      sampleVideoRef.current.pause();
      setIsSamplePlaying(false);
    }
  };

  const handleRewindSample = () => {
    if (!sampleVideoRef.current) return;
    playClick();
    sampleVideoRef.current.currentTime = Math.max(0, sampleVideoRef.current.currentTime - 3);
  };

  const handleReplaySample = () => {
    if (!sampleVideoRef.current) return;
    playClick();
    sampleVideoRef.current.currentTime = 0;
    sampleVideoRef.current.playbackRate = playbackSpeed;
    sampleVideoRef.current.play().catch(() => {});
    setIsSamplePlaying(true);
  };

  const handleCycleSpeed = () => {
    playClick();
    const speeds = [1, 0.75, 0.5];
    const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(next);
  };

  const handleStartCamera = async () => {
    playClick();
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Trình duyệt của bạn không hỗ trợ mở camera trực tiếp.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setRecordedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          'Bạn chưa cấp quyền sử dụng camera. Hãy bật quyền Camera trong cài đặt trình duyệt rồi thử lại.'
        );
      } else {
        setCameraError('Không thể khởi động camera lúc này. Vui lòng kiểm tra thiết bị.');
      }
    }
  };

  const handleStartRecordingConfirmed = () => {
    setShowRecordConfirm(false);
    if (!streamRef.current) return;
    try {
      chunksRef.current = [];
      const recorder = new MediaRecorder(streamRef.current);
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setIsRecording(false);
      };
      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      playClick();
    } catch {
      setCameraError('Thiết bị này chưa hỗ trợ ghi hình trực tiếp trên trình duyệt.');
    }
  };

  const handleStopRecording = () => {
    playClick();
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
  };

  const handleDiscardRecording = () => {
    playClick();
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
  };

  const handlePrevSentence = () => {
    if (currentIndex === 0) return;
    playClick();
    setCurrentIndex((i) => i - 1);
    setActiveSignIdx(0);
    setIsSamplePlaying(false);
  };

  const handleNextSentence = () => {
    playClick();
    if (currentIndex + 1 < sentences.length) {
      setCurrentIndex((i) => i + 1);
      setActiveSignIdx(0);
      setIsSamplePlaying(false);
    } else {
      playCorrect();
      stopCamera();
      setCompletedFlow(true);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 border border-slate-200 dark:border-slate-700 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
          Đang chuẩn bị phòng luyện tập SIGN MIRROR...
        </p>
      </div>
    );
  }

  if (sentences.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 border border-slate-200 dark:border-slate-700 text-center space-y-4">
        <Camera className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
        <h3 className="text-lg font-black text-slate-800 dark:text-white">
          Chưa có câu luyện tập SIGN MIRROR cho câu chuyện này
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold max-w-md mx-auto">
          Quản trị viên có thể bổ sung các câu truyện và video ký hiệu mẫu trong mục Admin → SIGN MIRROR.
        </p>
        {onBackToLessons && (
          <button
            onClick={onBackToLessons}
            className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm"
          >
            Quay lại học câu chuyện
          </button>
        )}
      </div>
    );
  }

  if (completedFlow) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 border-2 border-emerald-300 dark:border-emerald-700 shadow-xl text-center space-y-6"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-11 h-11" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">
            Tuyệt vời! Bạn đã luyện hết câu chuyện {story?.title}
          </h2>
          <p className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
            Mỗi lần đứng trước gương thực hành là một bước tiến gần hơn để giao tiếp tự nhiên và ấm áp cùng con mỗi ngày.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={() => {
              playClick();
              setCurrentIndex(0);
              setActiveSignIdx(0);
              setCompletedFlow(false);
            }}
            className="px-6 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-black text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Luyện lại từ đầu</span>
          </button>
          {onBackToLessons && (
            <button
              onClick={() => {
                playClick();
                onBackToLessons();
              }}
              className="px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-sm flex items-center gap-2 shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Quay lại bài học</span>
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  const gridRatioClass =
    splitRatio === 'sample-wide'
      ? 'lg:grid-cols-[1.55fr_1fr]'
      : splitRatio === 'camera-wide'
      ? 'lg:grid-cols-[1fr_1.55fr]'
      : 'lg:grid-cols-2';

  const progressPercent = ((currentIndex + 1) / sentences.length) * 100;

  return (
    <div className="space-y-5">
      {/* Top Bar: Privacy + Layout Ratio Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>
            Camera xử lý trực tiếp trên thiết bị — không tự động ghi hình hay gửi video lên máy chủ.
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
          <Columns className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300 ml-1.5 mr-0.5" />
          {[
            { id: 'balanced', label: '50 / 50' },
            { id: 'sample-wide', label: 'Video lớn' },
            { id: 'camera-wide', label: 'Camera lớn' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => {
                playClick();
                setSplitRatio(r.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                splitRatio === r.id
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split View: LEFT Sample Video | RIGHT Live Camera */}
      <div className={`grid grid-cols-1 ${gridRatioClass} gap-5 items-stretch`}>
        {/* LEFT PANEL: Sample Sign Video */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-purple-200 dark:border-purple-800/70 p-4 md:p-5 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-black shrink-0">
                Video mẫu
              </span>
              <h3 className="font-black text-slate-800 dark:text-white text-sm truncate">
                {activeSign?.signName || 'Ký hiệu mẫu'}
              </h3>
            </div>
            <button
              onClick={() => setIsSampleExpanded(true)}
              title="Phóng to video mẫu"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-slate-600 dark:text-slate-200 transition-all"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Multi-sign selector pills if sentence has > 1 sign */}
          {currentSigns.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {currentSigns.map((sv, idx) => (
                <button
                  key={sv.signId || idx}
                  onClick={() => {
                    playClick();
                    setActiveSignIdx(idx);
                    setIsSamplePlaying(false);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all border ${
                    idx === activeSignIdx
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-purple-400'
                  }`}
                >
                  {idx + 1}. {sv.signName}
                </button>
              ))}
            </div>
          )}

          {/* Video container */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            {activeSign?.videoUrl ? (
              <video
                ref={sampleVideoRef}
                key={activeSign.videoUrl}
                src={activeSign.videoUrl}
                loop
                playsInline
                onPlay={() => setIsSamplePlaying(true)}
                onPause={() => setIsSamplePlaying(false)}
                className="w-full h-full object-contain"
              />
            ) : (
              <p className="text-slate-400 text-xs font-bold p-4">Chưa có video ký hiệu cho câu này</p>
            )}
            <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[11px] font-black">
              Tốc độ {playbackSpeed}x
            </span>
          </div>

          {/* Video description */}
          {activeSign?.description && (
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-purple-50/70 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-100 dark:border-purple-800/50">
              💡 {activeSign.description}
            </p>
          )}

          {/* Video Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleToggleSamplePlay}
              className="flex-1 min-w-[110px] py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              {isSamplePlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isSamplePlaying ? 'Tạm dừng' : 'Phát mẫu'}</span>
            </button>
            <button
              onClick={handleRewindSample}
              className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100 font-black text-xs flex items-center gap-1 transition-all"
              title="Tua lại 3 giây"
            >
              <Rewind className="w-4 h-4" />
              <span>-3s</span>
            </button>
            <button
              onClick={handleCycleSpeed}
              className="py-2.5 px-3 rounded-xl bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 font-black text-xs flex items-center gap-1 transition-all"
              title="Chỉnh tốc độ chậm để dễ quan sát"
            >
              <Gauge className="w-4 h-4" />
              <span>{playbackSpeed}x</span>
            </button>
            <button
              onClick={handleReplaySample}
              className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-100 font-black text-xs flex items-center gap-1 transition-all"
              title="Xem lại từ đầu"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Xem lại</span>
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Live Camera / Local Playback */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-emerald-200 dark:border-emerald-800/70 p-4 md:p-5 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                Gương thực hành
              </span>
              <h3 className="font-black text-slate-800 dark:text-white text-sm">
                {recordedUrl ? 'Xem lại thao tác vừa ghi' : 'Camera của bạn'}
              </h3>
            </div>

            {cameraActive && (
              <button
                onClick={() => {
                  playClick();
                  setMirrorFlip((v) => !v);
                }}
                title="Lật gương ngang"
                className={`p-2 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
                  mirrorFlip
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Camera Feed OR Consent Screen OR Playback */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            {recordedUrl ? (
              <video
                src={recordedUrl}
                controls
                autoPlay
                loop
                playsInline
                className={`w-full h-full object-contain ${mirrorFlip ? 'scale-x-[-1]' : ''}`}
              />
            ) : cameraActive ? (
              <>
                <video
                  ref={cameraVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${mirrorFlip ? 'scale-x-[-1]' : ''}`}
                />
                {isRecording && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black shadow animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span>Đang ghi hình cục bộ...</span>
                  </div>
                )}
              </>
            ) : (
              <div className="p-6 text-center space-y-3 max-w-xs">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Camera className="w-7 h-7" />
                </div>
                <p className="text-white font-black text-sm">
                  Bật camera để tự soi và tập theo video mẫu
                </p>
                <p className="text-slate-300 text-xs font-semibold leading-relaxed">
                  Hình ảnh chỉ hiển thị trực tiếp trên màn hình của bạn để bạn đối chiếu bằng mắt thường.
                </p>
                <button
                  onClick={handleStartCamera}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-md transition-all inline-flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Đồng ý & Bật Camera</span>
                </button>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Observation note (respects rule: do not auto-fail or fake AI accuracy) */}
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-emerald-50/70 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
            🪞 {motionAdapter.mode === 'visual-comparison' ? 'Quan sát chuyển động tay và nét mặt của bạn song song với video mẫu — không chấm điểm cứng nhắc.' : ''}
          </div>

          {/* Camera & Recording Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {!cameraActive && !recordedUrl ? (
              <button
                onClick={handleStartCamera}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Bật Camera Thực Hành</span>
              </button>
            ) : recordedUrl ? (
              <>
                <button
                  onClick={handleDiscardRecording}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa bản ghi & Tập tiếp</span>
                </button>
                <button
                  onClick={() => {
                    playClick();
                    handleDiscardRecording();
                    stopCamera();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 font-black text-xs flex items-center gap-1.5"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>Tắt Camera</span>
                </button>
              </>
            ) : (
              <>
                {!isRecording ? (
                  <button
                    onClick={() => setShowRecordConfirm(true)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>Ghi hình để xem lại</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Dừng & Phát lại</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    playClick();
                    stopCamera();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-red-100 dark:bg-red-950/80 hover:bg-red-200 dark:hover:bg-red-900 text-red-700 dark:text-red-300 font-black text-xs flex items-center gap-1.5 transition-all"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>Tắt Camera</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM AREA: Current Sentence, Signs List, Progress, Navigation */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Câu {currentIndex + 1} / {sentences.length}
          </span>
          <div className="flex-1 max-w-xs h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSentence?.id || currentIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            <p className="text-lg md:text-2xl font-black text-slate-800 dark:text-white leading-snug">
              “{currentSentence?.sentenceText}”
            </p>

            {currentSigns.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Ký hiệu trong câu:
                </span>
                {currentSigns.map((sv, idx) => (
                  <button
                    key={sv.signId || idx}
                    onClick={() => {
                      playClick();
                      setActiveSignIdx(idx);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-black border transition-all ${
                      idx === activeSignIdx
                        ? 'bg-purple-100 dark:bg-purple-900/70 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-600'
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    ✨ {sv.signName}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={handlePrevSentence}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-black text-sm flex items-center gap-1.5 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Câu trước</span>
          </button>

          <button
            onClick={handleNextSentence}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-emerald-600 hover:opacity-95 text-white font-black text-sm flex items-center gap-1.5 shadow-md transition-all"
          >
            <span>
              {currentIndex + 1 < sentences.length ? 'Câu tiếp theo' : 'Hoàn thành luyện tập'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Explicit Recording Consent Confirmation Modal */}
      {showRecordConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border-2 border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <h4 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>Xác nhận ghi hình tạm trên máy</span>
            </h4>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
              Video quay lại chỉ được lưu tạm trong bộ nhớ trình duyệt của bạn để bạn tự xem lại và so sánh. Video sẽ <strong>không</strong> được tự động tải lên máy chủ hay chia sẻ ra ngoài.
            </p>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowRecordConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleStartRecordingConfirmed}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-sm"
              >
                Bắt đầu ghi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Sample Video Modal */}
      {isSampleExpanded && activeSign?.videoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsSampleExpanded(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h4 className="font-black text-slate-800 dark:text-white">
                Video mẫu: {activeSign.signName}
              </h4>
              <button
                onClick={() => setIsSampleExpanded(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-black">
              <video
                src={activeSign.videoUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignMirrorView;
