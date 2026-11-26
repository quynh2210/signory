import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Sparkles,
  X,
  Trash2,
  Upload,
  Loader2,
  MailOpen,
  Flower2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Pin,
  Wind,
  Sun,
  Moon,
  Move,
  LayoutGrid,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { useTheme } from '../context/ThemeContext';
import { uploadMediaToCloudinary } from '../services/cloudinaryService';
import AtmosphericBackdrop from '../components/common/AtmosphericBackdrop';
import {
  CARD_TEMPLATES,
  CARD_SHAPES,
  KINDNESS_TOPICS,
  resolveCardWallLayout,
  getKindnessCards,
  createKindnessCard,
  deleteKindnessCard,
} from '../services/kindnessService';

const MIN_ZOOM = 0.65;
const MAX_ZOOM = 2.4;

export const WallOfKindnessPage = () => {
  const { user, userProfile } = useAuth();
  const { playClick, playCorrect, playIncorrect } = useSound();
  const { isDark, toggleTheme } = useTheme();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [windEnabled, setWindEnabled] = useState(true);
  const [viewMode, setViewMode] = useState('wall'); // 'wall' | 'grid'

  // Interactive Wall Viewport state (Pan & Zoom like an image / game canvas)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0, moved: 0 });
  const wallBoardRef = useRef(null);

  // Interactive Pin Placement mode
  const [pinMode, setPinMode] = useState(false);
  const [pendingPin, setPendingPin] = useState(null); // { posX, posY }

  // Expanded / zoomed card modal
  const [zoomedCard, setZoomedCard] = useState(null);

  // Create card modal
  const [showComposer, setShowComposer] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState(KINDNESS_TOPICS[0]);
  const [theme, setTheme] = useState('pastel');
  const [shape, setShape] = useState('note');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaPublicId, setMediaPublicId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    getKindnessCards().then((list) => {
      if (!active) return;
      setCards(list);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const filteredCards = useMemo(() => {
    if (selectedTopic === 'all') return cards;
    return cards.filter((c) => c.topic === selectedTopic);
  }, [cards, selectedTopic]);

  const getTemplate = (themeId) =>
    CARD_TEMPLATES.find((t) => t.id === themeId) || CARD_TEMPLATES[0];

  const getShapeClass = (shapeId) =>
    (CARD_SHAPES.find((s) => s.id === shapeId) || CARD_SHAPES[0]).className;

  // Start Pin Placement flow (requires login)
  const handleStartPinMode = () => {
    playClick();
    if (!user) {
      alert('Vui lòng đăng nhập để ghim tấm thiệp lên Bức Tường Yêu Thương!');
      return;
    }
    setDisplayName(userProfile?.displayName || user.displayName || '');
    if (viewMode === 'grid') {
      setPendingPin({
        posX: 20 + Math.round(Math.random() * 60),
        posY: 20 + Math.round(Math.random() * 55),
      });
      setShowComposer(true);
    } else {
      setPinMode(true);
    }
  };

  // Zoom helpers
  const adjustZoom = (delta) => {
    playClick();
    setZoom((z) => Number(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)).toFixed(2)));
  };

  const resetViewport = () => {
    playClick();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheelZoom = (e) => {
    if (viewMode !== 'wall') return;
    // Allow smooth wheel zoom over the wall canvas
    e.preventDefault();
    const step = e.deltaY < 0 ? 0.14 : -0.14;
    setZoom((z) => Number(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + step)).toFixed(2)));
  };

  // Pan & Pin Placement handlers
  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
      moved: 0,
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const dist = Math.hypot(dx, dy);
    dragStartRef.current.moved = Math.max(dragStartRef.current.moved, dist);
    if (dist > 3) {
      setPan({
        x: Math.max(-450, Math.min(450, dragStartRef.current.panX + dx)),
        y: Math.max(-320, Math.min(320, dragStartRef.current.panY + dy)),
      });
    }
  };

  const handlePointerUp = (e) => {
    const moved = dragStartRef.current.moved;
    setIsDragging(false);

    // If user clicked (didn't drag) while in Pin Placement mode, place pin right at that wall spot!
    if (pinMode && moved < 6 && wallBoardRef.current) {
      const rect = wallBoardRef.current.getBoundingClientRect();
      const relX = ((e.clientX - rect.left) / rect.width) * 100;
      const relY = ((e.clientY - rect.top) / rect.height) * 100;

      if (relX >= 2 && relX <= 98 && relY >= 2 && relY <= 98) {
        const clampedX = Math.round(Math.min(90, Math.max(10, relX)));
        const clampedY = Math.round(Math.min(86, Math.max(12, relY)));
        playCorrect();
        setPendingPin({ posX: clampedX, posY: clampedY });
        setPinMode(false);
        setShowComposer(true);
      }
    }
  };

  const handleUploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadMediaToCloudinary(file);
      playCorrect();
      setMediaUrl(res.url);
      setMediaPublicId(res.publicId);
    } catch (err) {
      playIncorrect();
      alert('Lỗi tải ảnh lên: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      const created = await createKindnessCard({
        uid: user.uid,
        displayName,
        message,
        topic,
        theme,
        shape,
        posX: pendingPin?.posX ?? null,
        posY: pendingPin?.posY ?? null,
        mediaUrl,
        mediaPublicId,
        mediaResourceType: 'image',
      });
      playCorrect();
      setCards((prev) => [created, ...prev]);
      setMessage('');
      setMediaUrl('');
      setMediaPublicId('');
      setPendingPin(null);
      setShowComposer(false);
    } catch (err) {
      playIncorrect();
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOwnCard = async (card) => {
    if (!window.confirm('Bạn muốn gỡ bỏ tấm thiệp này?')) return;
    playClick();
    await deleteKindnessCard({ cardId: card.id, actorUid: user.uid, isAdmin: false });
    setCards((prev) => prev.filter((c) => c.id !== card.id));
    if (zoomedCard?.id === card.id) setZoomedCard(null);
  };

  return (
    <div className="min-h-screen relative overflow-x-clip py-5 px-3 sm:px-5 transition-colors duration-500">
      {/* Surrounding Day/Night Sky (Sun+Clouds or Moon+Stars+Wind Flora) */}
      <AtmosphericBackdrop variant="kindness" />

      {/* ─── Game-Style HUD Container ─── */}
      <div className="relative z-10 max-w-[1360px] mx-auto space-y-4">
        {/* Top Game HUD Bar */}
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-3xl p-3.5 sm:p-4 border-2 border-amber-200/80 dark:border-slate-700 shadow-lg flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white leading-tight flex items-center gap-2">
                <span>Bức Tường Yêu Thương</span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-200 text-xs font-black">
                  {cards.length} thiệp
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-300">
                Kéo để di chuyển • Cuộn chuột hoặc dùng nút +/- để phóng to đọc thiệp • Chạm để mở toàn cảnh
              </p>
            </div>
          </div>

          {/* Interactive HUD Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={toggleTheme}
              className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-600 text-amber-900 dark:text-amber-200 text-xs font-black flex items-center gap-1.5 hover:scale-105 transition-transform"
              title="Đổi bầu trời Ngày / Đêm"
            >
              {isDark ? <Moon className="w-3.5 h-3.5 text-yellow-300" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>{isDark ? 'Ban Đêm' : 'Ban Ngày'}</span>
            </button>

            <button
              onClick={() => {
                playClick();
                setWindEnabled((v) => !v);
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all ${
                windEnabled
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Gió thổi: {windEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => {
                playClick();
                setViewMode((v) => (v === 'wall' ? 'grid' : 'wall'));
                setPinMode(false);
              }}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-black flex items-center gap-1.5"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{viewMode === 'wall' ? 'Dạng lưới' : 'Dạng tường'}</span>
            </button>

            <button
              onClick={pinMode ? () => setPinMode(false) : handleStartPinMode}
              className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition-all ${
                pinMode
                  ? 'bg-slate-700 text-white hover:bg-slate-800'
                  : 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:opacity-95 text-white hover:scale-105'
              }`}
            >
              {pinMode ? <X className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              <span>{pinMode ? 'Hủy chọn chỗ' : 'Ghim Thiệp Mới'}</span>
            </button>
          </div>
        </div>

        {/* Pin Placement Guidance Banner */}
        <AnimatePresence>
          {pinMode && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-gradient-to-r from-rose-500 to-amber-500 text-white px-5 py-3 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-black"
            >
              <div className="flex items-center gap-2">
                <Pin className="w-5 h-5 animate-bounce shrink-0" />
                <span>
                  Chế độ ghim thiệp đang bật: Hãy bấm vào bất kỳ vị trí trống nào trên Bức Tường bên dưới để đặt thiệp của bạn!
                </span>
              </div>
              <button
                onClick={() => {
                  setPendingPin({
                    posX: 18 + Math.round(Math.random() * 64),
                    posY: 18 + Math.round(Math.random() * 60),
                  });
                  setPinMode(false);
                  setShowComposer(true);
                }}
                className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black"
              >
                Chọn ngẫu nhiên →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Topic Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedTopic('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-black border transition-all backdrop-blur-md ${
              selectedTopic === 'all'
                ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-sm'
                : 'bg-white/85 dark:bg-slate-800/85 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            Tất cả ({cards.length})
          </button>
          {KINDNESS_TOPICS.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black border transition-all backdrop-blur-md ${
                selectedTopic === t
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                  : 'bg-white/85 dark:bg-slate-800/85 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-rose-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ─── MAIN AREA: INTERACTIVE WALL VIEWPORT OR FALLBACK GRID ─── */}
        {loading ? (
          <div className="py-24 flex justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filteredCards.map((card, idx) => {
              const tpl = getTemplate(card.theme);
              const shapeCls = getShapeClass(card.shape);
              const isOwn = user && card.uid === user.uid;
              return (
                <div
                  key={card.id}
                  style={{ animationDelay: `${(idx % 5) * 0.6}s` }}
                  className={windEnabled ? 'animate-card-levitate' : ''}
                >
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    onClick={() => {
                      playClick();
                      setZoomedCard(card);
                    }}
                    className={`cursor-pointer border-2 p-6 shadow-md hover:shadow-xl transition-all h-full flex flex-col justify-between space-y-4 ${shapeCls} ${tpl.lightClass} ${tpl.darkClass}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full bg-white/75 dark:bg-black/35">
                        <span>{tpl.accent}</span>
                        <span>{card.topic || 'Yêu thương'}</span>
                      </span>
                      {isOwn && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOwnCard(card);
                          }}
                          className="p-1.5 rounded-full bg-white/75 dark:bg-black/35 text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {card.mediaUrl && (
                      <div className="rounded-2xl overflow-hidden h-36 border border-black/10 dark:border-white/10">
                        <img src={card.mediaUrl} alt={card.displayName} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-sm font-semibold leading-relaxed line-clamp-4">“{card.message}”</p>
                    <div className="pt-2 border-t border-black/10 dark:border-white/15 flex items-center justify-between text-xs font-black">
                      <span>— {card.displayName}</span>
                      <span className="opacity-70 text-[11px]">Mở thiệp →</span>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── INTERACTIVE PAN & ZOOM KINDNESS WALL CANVAS ─── */
          <div
            onWheel={handleWheelZoom}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={() => setIsDragging(false)}
            className={`relative h-[68vh] min-h-[500px] max-h-[760px] rounded-[36px] overflow-hidden border-4 shadow-2xl select-none touch-none transition-colors ${
              pinMode
                ? 'border-rose-400 dark:border-amber-400 ring-4 ring-rose-300/60 dark:ring-amber-400/40 cursor-crosshair'
                : isDragging
                ? 'border-amber-300/80 dark:border-indigo-700 cursor-grabbing'
                : 'border-amber-200/80 dark:border-indigo-800/80 cursor-grab'
            }`}
          >
            {/* Pan & Zoom Transformed Wall Board */}
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-75"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
              {/* Actual Wall Board Surface (1150px x 680px logical world) */}
              <div
                ref={wallBoardRef}
                className={`relative w-[1080px] h-[640px] shrink-0 rounded-[40px] border-[10px] shadow-2xl overflow-hidden backdrop-blur-md ${
                  isDark
                    ? 'bg-gradient-to-br from-[#161c33]/78 via-[#241b3d]/78 to-[#162632]/78 border-[#4b3f6b]/90 shadow-indigo-950/60'
                    : 'bg-gradient-to-br from-[#fff8ec]/76 via-[#fef1e6]/76 to-[#fff1f2]/76 border-[#e3c89c]/90 shadow-amber-900/15'
                }`}
              >
                {/* Gentle sakura petals blowing across the wall board when wind is ON */}
                {windEnabled && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                    {[
                      { r: '8%', s: 15, d: '-1s', t: '9s', c: '#fda4af' },
                      { r: '24%', s: 13, d: '-4.5s', t: '11s', c: '#fbcfe8' },
                      { r: '42%', s: 16, d: '-7.2s', t: '10s', c: '#f9a8d4' },
                      { r: '15%', s: 12, d: '-2.8s', t: '12s', c: '#ffe4e6' },
                    ].map((pt, idx) => (
                      <div
                        key={idx}
                        className="absolute top-0 animate-sakura-fall"
                        style={{ right: pt.r, animationDelay: pt.d, animationDuration: pt.t }}
                      >
                        <svg width={pt.s} height={pt.s} viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 2 C15.2 4.5, 18.8 8.8, 17.5 14.2 C16.5 18.4, 13.6 21.2, 12 21.8 C10.4 21.2, 7.5 18.4, 6.5 14.2 C5.2 8.8, 8.8 4.5, 12 2 Z"
                            fill={pt.c}
                            fillOpacity={isDark ? '0.78' : '0.85'}
                          />
                        </svg>
                      </div>
                    ))}
                  </div>
                )}
                {/* Decorative Wall Cork/Garden Grid Texture + Fairy Garland Lights */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-20"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, currentColor 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                    color: isDark ? '#94a3b8' : '#b48a5a',
                  }}
                />

                {/* Top Warm String Lights / Garland along top of the Wall */}
                <svg
                  className="pointer-events-none absolute top-0 left-0 w-full h-14 opacity-90"
                  viewBox="0 0 1080 56"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 8 Q 180 42, 360 12 T 720 14 T 1080 8"
                    stroke={isDark ? '#64748b' : '#b08968'}
                    strokeWidth="2.5"
                    fill="none"
                  />
                  {[90, 180, 270, 420, 540, 660, 810, 900, 990].map((cx, i) => (
                    <circle
                      key={cx}
                      cx={cx}
                      cy={i % 2 === 0 ? 22 : 16}
                      r="5"
                      fill={i % 3 === 0 ? '#fde047' : i % 3 === 1 ? '#fda4af' : '#86efac'}
                      opacity={isDark ? '0.95' : '0.85'}
                    />
                  ))}
                </svg>

                {/* Center Soft Emblem Watermark */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07] dark:opacity-[0.08]">
                  <div className="text-center space-y-2">
                    <Heart className="w-36 h-36 mx-auto text-rose-500 fill-rose-500" />
                    <p className="text-4xl font-black tracking-widest uppercase">SIGNORY WALL</p>
                  </div>
                </div>

                {/* Empty filter message */}
                {filteredCards.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/90 dark:bg-slate-800/90 px-6 py-4 rounded-3xl border border-slate-200 dark:border-slate-700 text-center">
                      <Flower2 className="w-8 h-8 text-rose-400 mx-auto mb-1" />
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                        Chưa có tấm thiệp nào trong chủ đề này.
                      </p>
                    </div>
                  </div>
                )}

                {/* Pinned Cards scattered naturally across the Wall */}
                {filteredCards.map((card, idx) => {
                  const layout = resolveCardWallLayout(card, idx);
                  const tpl = getTemplate(card.theme);
                  const shapeCls = getShapeClass(layout.shape);
                  const isDetailedZoom = zoom >= 1.25;

                  return (
                    <div
                      key={card.id}
                      style={{
                        left: `${layout.posX}%`,
                        top: `${layout.posY}%`,
                        transform: `translate(-50%, -50%) rotate(${layout.rotation}deg)`,
                      }}
                      className="absolute z-10 hover:z-40"
                    >
                      <motion.div
                        animate={
                          windEnabled
                            ? {
                                rotate: [
                                  -1.8,
                                  1.8,
                                  -1.8,
                                ],
                                y: [0, -5, 0],
                              }
                            : undefined
                        }
                        transition={
                          windEnabled
                            ? {
                                duration: 4.4 + (idx % 4) * 0.7,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: (idx % 6) * 0.45,
                              }
                            : undefined
                        }
                        whileHover={{ scale: 1.12, zIndex: 40 }}
                        onClick={(e) => {
                          if (pinMode) return;
                          e.stopPropagation();
                          if (dragStartRef.current.moved >= 6) return;
                          playClick();
                          setZoomedCard(card);
                        }}
                        className={`relative w-44 sm:w-48 p-3.5 border-2 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer ${shapeCls} ${tpl.lightClass} ${tpl.darkClass}`}
                      >
                        {/* Colored Pushpin at top center */}
                        <div
                          className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center"
                          style={{ backgroundColor: tpl.pinColor }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                        </div>

                        <div className="flex items-center justify-between gap-1 mb-1.5 pt-0.5">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/35 truncate max-w-[125px]">
                            {tpl.accent} {card.topic || 'Yêu thương'}
                          </span>
                          {card.mediaUrl && <span className="text-xs">🖼️</span>}
                        </div>

                        {card.mediaUrl && isDetailedZoom && (
                          <img
                            src={card.mediaUrl}
                            alt={card.displayName}
                            className="w-full h-20 object-cover rounded-xl mb-1.5 border border-black/10"
                          />
                        )}

                        <p
                          className={`font-semibold leading-snug ${
                            isDetailedZoom
                              ? 'text-xs line-clamp-5'
                              : 'text-[11px] line-clamp-3'
                          }`}
                        >
                          “{card.message}”
                        </p>

                        <div className="mt-2 pt-1.5 border-t border-black/10 dark:border-white/15 flex items-center justify-between text-[10px] font-black">
                          <span className="truncate max-w-[100px]">— {card.displayName}</span>
                          <span className="opacity-75">Mở ✨</span>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom-Right Floating Zoom & Pan HUD Controls */}
            <div
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl"
            >
              <button
                onClick={() => adjustZoom(-0.2)}
                disabled={zoom <= MIN_ZOOM}
                title="Thu nhỏ"
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-black text-slate-700 dark:text-slate-200 min-w-[48px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => adjustZoom(0.2)}
                disabled={zoom >= MAX_ZOOM}
                title="Phóng to để đọc rõ thiệp"
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={resetViewport}
                title="Đặt lại khung nhìn 100%"
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-l border-slate-200 dark:border-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom-Left Subtle Navigation Hint */}
            <div className="pointer-events-none hidden sm:flex absolute bottom-4 left-4 z-20 items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 shadow-sm">
              <Move className="w-3.5 h-3.5 text-rose-500" />
              <span>Kéo di chuyển tường • Phóng to ≥125% để đọc rõ chữ trên tường</span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Zoomed Card & Envelope Opening Modal (When Clicking a Pinned Card) ─── */}
      <AnimatePresence>
        {zoomedCard && (() => {
          const tpl = getTemplate(zoomedCard.theme);
          const isOwn = user && zoomedCard.uid === user.uid;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setZoomedCard(null)}
              className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.72, opacity: 0, rotate: -4, y: 24 }}
                animate={{ scale: 1, opacity: 1, rotate: 0, y: 0 }}
                exit={{ scale: 0.84, opacity: 0, y: 16 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                onClick={(e) => e.stopPropagation()}
                className={`relative max-w-lg w-full rounded-[32px] border-4 p-7 md:p-9 shadow-2xl space-y-5 overflow-hidden ${tpl.lightClass} ${tpl.darkClass}`}
              >
                <div className="flex items-center justify-between gap-2 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-black/35 text-xs font-black">
                    <MailOpen className="w-4 h-4 text-rose-500" />
                    <span>{tpl.name}</span>
                    <span>•</span>
                    <span>{zoomedCard.topic}</span>
                  </div>
                  <button
                    onClick={() => setZoomedCard(null)}
                    className="p-2 rounded-full bg-white/80 dark:bg-black/35 hover:scale-105 transition-transform"
                    aria-label="Đóng thiệp"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {zoomedCard.mediaUrl && (
                  <div className="rounded-2xl overflow-hidden border-2 border-white/60 dark:border-white/20 shadow-md max-h-64 bg-black/10 relative z-10">
                    <img
                      src={zoomedCard.mediaUrl}
                      alt={zoomedCard.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4 relative z-10"
                >
                  <p className="text-base md:text-lg font-bold leading-relaxed whitespace-pre-line">
                    “{zoomedCard.message}”
                  </p>

                  <div className="pt-3 border-t border-black/10 dark:border-white/15 flex items-center justify-between">
                    <div>
                      <p className="font-black text-sm">{zoomedCard.displayName}</p>
                      <p className="text-[11px] opacity-75">
                        {zoomedCard.createdAt
                          ? new Date(zoomedCard.createdAt).toLocaleDateString('vi-VN')
                          : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOwn && (
                        <button
                          onClick={() => handleDeleteOwnCard(zoomedCard)}
                          className="px-3.5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Gỡ thiệp</span>
                        </button>
                      )}
                      <button
                        onClick={() => setZoomedCard(null)}
                        className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-xs font-black"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ─── Create & Pin Card Modal ─── */}
      {showComposer && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowComposer(false)}
        >
          <form
            onSubmit={handleCreateCard}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-800 rounded-[32px] p-6 md:p-7 max-w-lg w-full max-h-[90vh] overflow-y-auto border-2 border-rose-200 dark:border-slate-700 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-black text-xl text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <span>Ghim Thiệp Yêu Thương</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowComposer(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pendingPin && (
              <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <Pin className="w-4 h-4" /> Đã chọn vị trí trên tường ({pendingPin.posX}%, {pendingPin.posY}%)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowComposer(false);
                    setPinMode(true);
                  }}
                  className="underline font-black"
                >
                  Đổi vị trí
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-600 dark:text-slate-300 mb-1">
                  Tên hiển thị / Biệt danh
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="VD: Mẹ Bé Sóc"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 dark:text-slate-300 mb-1">
                  Chủ đề lời nhắn
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm font-bold"
                >
                  {KINDNESS_TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-600 dark:text-slate-300 mb-1">
                Lời nhắn tích cực *
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Gửi lời động viên tới các bậc cha mẹ, hoặc điều đáng yêu bạn muốn lưu giữ..."
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm font-semibold"
              />
            </div>

            {/* 7 Color Templates */}
            <div>
              <label className="block text-xs font-black text-slate-600 dark:text-slate-300 mb-1.5">
                Màu sắc & phong cách thiệp:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CARD_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setTheme(tpl.id)}
                    className={`p-2 rounded-2xl border-2 text-left transition-all ${tpl.lightClass} ${tpl.darkClass} ${
                      theme === tpl.id ? 'ring-2 ring-rose-500 scale-[1.03]' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span className="text-sm block">{tpl.accent}</span>
                    <span className="text-[11px] font-black block truncate">{tpl.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5 Card Shapes */}
            <div>
              <label className="block text-xs font-black text-slate-600 dark:text-slate-300 mb-1.5">
                Hình dáng tấm thiệp:
              </label>
              <div className="flex flex-wrap gap-2">
                {CARD_SHAPES.map((sh) => (
                  <button
                    key={sh.id}
                    type="button"
                    onClick={() => setShape(sh.id)}
                    className={`px-3 py-1.5 text-xs font-black border-2 transition-all ${sh.className} ${
                      shape === sh.id
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {sh.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Image Attachment */}
            <div>
              <label className="block text-xs font-black text-slate-600 dark:text-slate-300 mb-1">
                Ảnh kỷ niệm đính kèm (tùy chọn)
              </label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-black text-xs flex items-center gap-1.5 cursor-pointer">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{uploading ? 'Đang tải...' : 'Chọn ảnh'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0])}
                  />
                </label>
                {mediaUrl && (
                  <div className="flex items-center gap-2">
                    <img src={mediaUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border" />
                    <button
                      type="button"
                      onClick={() => {
                        setMediaUrl('');
                        setMediaPublicId('');
                      }}
                      className="text-xs text-red-500 font-bold"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowComposer(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-sm shadow-md disabled:opacity-60"
              >
                {submitting ? 'Đang ghim thiệp...' : 'Ghim Lên Bức Tường'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default WallOfKindnessPage;
