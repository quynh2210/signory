import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Plus,
  History,
  Trash2,
  Sparkles,
  BookOpen,
  Video,
  Play,
  Compass,
  Camera,
  Heart,
  Users,
  MessageCircle,
  Loader2,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import {
  SIGNORY_MASCOT_AVATAR,
  SUGGESTED_PROMPTS,
} from '../../config/aiConfig';
import {
  getUserAIConversations,
  createAIConversation,
  getAIConversationMessages,
  deleteAIConversation,
  clearAllUserAIConversations,
  sendMessageToSignoryAI,
  warmUpAIKnowledgeCache,
} from '../../services/aiService';

/**
 * Lightweight, safe React formatter supporting paragraphs, **bold**, *italic*, `inline code`,
 * bullet lists (- / *), and numbered lists (1. / 2.) without dangerouslySetInnerHTML.
 */
function FormattedAIMessage({ text = '' }) {
  const renderInline = (line) => {
    const parts = [];
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    let lastIndex = 0;
    let match;
    let idx = 0;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`t-${idx++}`}>{line.slice(lastIndex, match.index)}</span>);
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={`b-${idx++}`} className="font-extrabold text-slate-900 dark:text-white">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={`i-${idx++}`} className="italic">
            {token.slice(1, -1)}
          </em>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={`c-${idx++}`}
            className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-xs font-mono text-emerald-700 dark:text-emerald-300"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(<span key={`e-${idx++}`}>{line.slice(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : line;
  };

  const lines = String(text || '').split('\n');
  const blocks = [];
  let currentList = null;

  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  lines.forEach((rawLine, i) => {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    const numMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);

    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [], key: `ul-${i}` };
      }
      currentList.items.push(bulletMatch[1]);
    } else if (numMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [], key: `ol-${i}` };
      }
      currentList.items.push(numMatch[2]);
    } else {
      flushList();
      blocks.push({ type: 'p', text: trimmed, key: `p-${i}` });
    }
  });
  flushList();

  return (
    <div className="space-y-2 text-sm leading-relaxed break-words">
      {blocks.map((b) => {
        if (b.type === 'ul') {
          return (
            <ul key={b.key} className="list-disc pl-5 space-y-1">
              {b.items.map((item, idx) => (
                <li key={idx}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (b.type === 'ol') {
          return (
            <ol key={b.key} className="list-decimal pl-5 space-y-1">
              {b.items.map((item, idx) => (
                <li key={idx}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }
        return <p key={b.key}>{renderInline(b.text)}</p>;
      })}
    </div>
  );
}

/**
 * Animated typing effect for the newest AI response only
 */
function TypingText({ fullText, isNew, onComplete }) {
  const [visibleLen, setVisibleLen] = useState(0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isNew) return;
    const step = Math.max(4, Math.ceil(fullText.length / 45));
    const timer = setInterval(() => {
      setVisibleLen((prev) => {
        const next = prev + step;
        if (next >= fullText.length) {
          clearInterval(timer);
          onCompleteRef.current?.();
          return fullText.length;
        }
        return next;
      });
    }, 20);
    return () => clearInterval(timer);
  }, [fullText, isNew]);

  const displayed = isNew ? fullText.slice(0, visibleLen) : fullText;
  return <FormattedAIMessage text={displayed} />;
}

export const SignoryChatbot = () => {
  const { user } = useAuth();
  const { playClick, playCorrect } = useSound();
  const navigate = useNavigate();
  const location = useLocation();

  const uid = user?.uid || 'guest';

  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newestAnimatedMsgId, setNewestAnimatedMsgId] = useState(null);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorBanner, setErrorBanner] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const activeConvRef = useRef(activeConvId);
  useEffect(() => {
    activeConvRef.current = activeConvId;
  }, [activeConvId]);
  const prevUidRef = useRef(uid);

  // Hide floating launcher only on full-screen admin or watch page to avoid overlapping controls
  const hideLauncher =
    location.pathname.startsWith('/admin') || location.pathname.startsWith('/watch/');

  // Load conversations when opened or user changes
  useEffect(() => {
    const uidChanged = prevUidRef.current !== uid;
    if (uidChanged) {
      prevUidRef.current = uid;
      activeConvRef.current = null;
    }
    if (!isOpen) return;
    warmUpAIKnowledgeCache();
    let mounted = true;
    const load = async () => {
      const convs = await getUserAIConversations(uid);
      if (!mounted) return;
      setConversations(convs);
      if (convs.length > 0 && (!activeConvRef.current || uidChanged)) {
        const latestId = convs[0].conversationId || convs[0].id;
        setActiveConvId(latestId);
        const msgs = await getAIConversationMessages(uid, latestId);
        if (mounted) setMessages(msgs);
      } else if (convs.length === 0) {
        setActiveConvId(null);
        setMessages([]);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isOpen, uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSelectConversation = async (convId) => {
    playClick();
    setActiveConvId(convId);
    setShowHistory(false);
    setNewestAnimatedMsgId(null);
    setErrorBanner(null);
    const msgs = await getAIConversationMessages(uid, convId);
    setMessages(msgs);
  };

  const handleNewConversation = async () => {
    playClick();
    setErrorBanner(null);
    setShowHistory(false);
    setNewestAnimatedMsgId(null);
    const conv = await createAIConversation(uid, 'Cuộc trò chuyện mới');
    setConversations((prev) => [conv, ...prev]);
    setActiveConvId(conv.conversationId);
    setMessages([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleDeleteOneConversation = async (e, convId) => {
    e.stopPropagation();
    playClick();
    await deleteAIConversation(uid, convId);
    const updated = conversations.filter((c) => (c.conversationId || c.id) !== convId);
    setConversations(updated);
    if (activeConvId === convId) {
      if (updated.length > 0) {
        const nextId = updated[0].conversationId || updated[0].id;
        setActiveConvId(nextId);
        const msgs = await getAIConversationMessages(uid, nextId);
        setMessages(msgs);
      } else {
        setActiveConvId(null);
        setMessages([]);
      }
    }
  };

  const handleClearAllHistory = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện SIGNORY AI của bạn?')) {
      return;
    }
    playClick();
    await clearAllUserAIConversations(uid);
    setConversations([]);
    setActiveConvId(null);
    setMessages([]);
    setShowHistory(false);
  };

  const handleSend = async (overrideText = null) => {
    const textToSend = (overrideText !== null ? overrideText : inputText).trim();
    if (!textToSend || isSending) return;

    playClick();
    setErrorBanner(null);
    if (overrideText === null) setInputText('');

    // Optimistic user bubble
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMsg = {
      messageId: optimisticId,
      role: 'user',
      content: textToSend,
      createdAt: new Date().toISOString(),
    };
    const prevMessages = messages;
    setMessages((prev) => [...prev, optimisticMsg]);
    setIsSending(true);

    try {
      const res = await sendMessageToSignoryAI({
        uid,
        conversationId: activeConvId,
        userMessage: textToSend,
        existingMessages: prevMessages,
      });

      playCorrect();
      setActiveConvId(res.conversationId);
      setNewestAnimatedMsgId(res.aiMessage.messageId);
      setMessages([...prevMessages, res.userMessage, res.aiMessage]);

      const updatedConvs = await getUserAIConversations(uid);
      setConversations(updatedConvs);
    } catch (err) {
      setMessages(prevMessages);
      if (overrideText === null) setInputText(textToSend);
      setErrorBanner(err.message || 'Không thể kết nối PLUNIS AI lúc này.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleActionClick = (action) => {
    playClick();
    if (action.type === 'video' && action.mediaUrl) {
      setPreviewVideo({ title: action.label, url: action.mediaUrl, watchUrl: action.url });
      return;
    }
    if (action.url) {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
      navigate(action.url);
    }
  };

  const getActionIcon = (action) => {
    if (action.type === 'video') return <Video className="w-3.5 h-3.5 shrink-0" />;
    if (action.type === 'sign_mirror') return <Camera className="w-3.5 h-3.5 shrink-0" />;
    if (action.url === '/kindness') return <Heart className="w-3.5 h-3.5 shrink-0" />;
    if (action.url === '/circle') return <Users className="w-3.5 h-3.5 shrink-0" />;
    if (action.type === 'story') return <BookOpen className="w-3.5 h-3.5 shrink-0" />;
    return <Compass className="w-3.5 h-3.5 shrink-0" />;
  };

  if (hideLauncher) return null;

  return (
    <>
      {/* Floating Mascot Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playClick();
              setIsOpen(true);
            }}
            aria-label="Mở trợ lý PLUNIS AI"
            className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 group flex items-center gap-2.5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-slate-800 dark:to-slate-800 border-2 border-amber-400 dark:border-amber-500 rounded-full p-1.5 pr-4 shadow-2xl hover:shadow-amber-400/30 transition-all"
          >
            <div className="relative w-12 h-12 rounded-full bg-amber-100 dark:bg-slate-700 border-2 border-amber-300 dark:border-amber-500 overflow-hidden flex items-center justify-center shrink-0">
              <img
                src={SIGNORY_MASCOT_AVATAR}
                alt="PLUNIS AI Mascot"
                className="w-11 h-11 object-contain"
              />
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-white dark:border-slate-800 animate-pulse" />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-amber-950 dark:text-amber-300 leading-tight flex items-center gap-1 whitespace-nowrap">
                <span>PLUNIS AI</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              </p>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 z-50 md:w-[420px] md:h-[630px] md:max-h-[86vh] bg-white dark:bg-slate-900 md:rounded-[28px] shadow-2xl border-0 md:border-2 border-amber-200 dark:border-slate-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 dark:from-amber-700 dark:via-amber-800 dark:to-slate-800 text-amber-950 dark:text-white px-4 py-3.5 flex items-center justify-between gap-2 border-b border-amber-300 dark:border-slate-700 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-slate-700 p-0.5 border border-amber-200 dark:border-amber-500/50 shrink-0 overflow-hidden flex items-center justify-center shadow-sm">
                  <img
                    src={SIGNORY_MASCOT_AVATAR}
                    alt="PLUNIS AI"
                    className="w-9 h-9 object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-base tracking-tight flex items-center gap-1.5 text-amber-950 dark:text-white">
                    <span>PLUNIS AI</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-800 dark:text-yellow-300 shrink-0" />
                  </h3>
                  <p className="text-[11px] font-bold text-amber-900/80 dark:text-amber-200 truncate">
                    {isSending ? 'Đang suy nghĩ...' : 'Trợ lý ký hiệu & bạn đồng hành'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleNewConversation}
                  title="Cuộc trò chuyện mới"
                  className="p-2 rounded-xl bg-amber-950/10 hover:bg-amber-950/20 dark:bg-white/15 dark:hover:bg-white/25 text-amber-950 dark:text-white transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    playClick();
                    setShowHistory((v) => !v);
                  }}
                  title="Lịch sử trò chuyện"
                  className={`p-2 rounded-xl transition-all ${
                    showHistory
                      ? 'bg-white text-amber-700 dark:bg-amber-500 dark:text-slate-950 shadow-sm'
                      : 'bg-amber-950/10 hover:bg-amber-950/20 dark:bg-white/15 dark:hover:bg-white/25 text-amber-950 dark:text-white'
                  }`}
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    playClick();
                    setIsOpen(false);
                  }}
                  title="Đóng"
                  className="p-2 rounded-xl bg-amber-950/10 hover:bg-amber-950/20 dark:bg-white/15 dark:hover:bg-white/25 text-amber-950 dark:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body: History Overlay OR Messages */}
            <div className="flex-1 relative overflow-hidden flex flex-col bg-amber-50/30 dark:bg-slate-900">
              {showHistory ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-slate-900">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setShowHistory(false)}
                      className="inline-flex items-center gap-1 text-xs font-black text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400"
                    >
                      <ChevronLeft className="w-4 h-4" /> Quay lại chat
                    </button>
                    {conversations.length > 0 && (
                      <button
                        onClick={handleClearAllHistory}
                        className="inline-flex items-center gap-1 text-xs font-black text-red-500 hover:text-red-600 dark:text-red-400 px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả lịch sử
                      </button>
                    )}
                  </div>

                  {conversations.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                      <MessageCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        Bạn chưa có lịch sử trò chuyện nào.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {conversations.map((conv) => {
                        const cId = conv.conversationId || conv.id;
                        const isActive = cId === activeConvId;
                        return (
                          <div
                            key={cId}
                            onClick={() => handleSelectConversation(cId)}
                            className={`flex items-center justify-between gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${
                              isActive
                                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                                {conv.title || 'Cuộc trò chuyện'}
                              </p>
                              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                                {conv.updatedAt
                                  ? new Date(conv.updatedAt).toLocaleString('vi-VN')
                                  : ''}
                              </p>
                            </div>
                            <button
                              onClick={(e) => handleDeleteOneConversation(e, cId)}
                              title="Xóa cuộc trò chuyện này"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Welcome Empty State */}
                  {messages.length === 0 && (
                    <div className="space-y-4 pt-2">
                      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border-2 border-amber-200 dark:border-slate-700 shadow-sm flex items-start gap-3">
                        <img
                          src={SIGNORY_MASCOT_AVATAR}
                          alt="PLUNIS AI"
                          className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-slate-700 object-contain shrink-0 border border-amber-300 dark:border-slate-600"
                        />
                        <div className="space-y-1.5">
                          <p className="font-black text-slate-800 dark:text-white text-sm">
                            Chào bạn! Mình là PLUNIS AI ✨
                          </p>
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
                            Mình có thể giải đáp cách làm các ký hiệu đã xác minh trong sách truyện, gợi ý bài học cho gia đình, hoặc lắng nghe và chia sẻ cùng bạn khi đồng hành học ký hiệu với bé.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400 px-1">
                          Gợi ý bắt đầu nhanh:
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {SUGGESTED_PROMPTS.map((prompt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(prompt)}
                              disabled={isSending}
                              className="text-left text-xs font-bold p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/70 dark:hover:bg-slate-700/80 transition-all shadow-sm"
                            >
                              “{prompt}”
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Bubbles */}
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    const msgId = msg.messageId || msg.id;

                    return (
                      <div
                        key={msgId}
                        className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isUser && (
                          <img
                            src={SIGNORY_MASCOT_AVATAR}
                            alt="PLUNIS AI"
                            className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-slate-800 object-contain border border-amber-300 dark:border-slate-700 shrink-0"
                          />
                        )}

                        <div className={`max-w-[82%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`px-4 py-3 rounded-2xl shadow-sm ${
                              isUser
                                ? 'bg-gradient-to-br from-amber-400 to-yellow-500 dark:from-amber-600 dark:to-amber-700 text-amber-950 dark:text-white rounded-br-sm font-bold text-sm'
                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-sm'
                            }`}
                          >
                            {isUser ? (
                              <p className="whitespace-pre-wrap break-words leading-relaxed">
                                {msg.content}
                              </p>
                            ) : (
                              <TypingText
                                fullText={msg.content || ''}
                                isNew={msgId === newestAnimatedMsgId}
                                onComplete={() => {
                                  if (msgId === newestAnimatedMsgId) setNewestAnimatedMsgId(null);
                                }}
                              />
                            )}
                          </div>

                          {/* Action Buttons attached to AI message */}
                          {!isUser && msg.actions && msg.actions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {msg.actions.map((act) => (
                                <button
                                  key={act.id}
                                  onClick={() => handleActionClick(act)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900 transition-all shadow-sm"
                                >
                                  {getActionIcon(act)}
                                  <span>{act.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Thinking Indicator */}
                  {isSending && (
                    <div className="flex items-end gap-2">
                      <img
                        src={SIGNORY_MASCOT_AVATAR}
                        alt="PLUNIS AI"
                        className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-slate-800 object-contain border border-amber-300 dark:border-slate-700 shrink-0"
                      />
                      <div className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-300 shadow-sm">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                        <span>PLUNIS AI đang suy nghĩ...</span>
                      </div>
                    </div>
                  )}

                  {/* Error Notice */}
                  {errorBanner && (
                    <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-bold flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorBanner}</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Subtle safety disclaimer */}
              {!showHistory && (
                <div className="px-3 py-1.5 bg-amber-50/80 dark:bg-slate-800/80 border-t border-amber-100 dark:border-slate-700 text-[10px] font-semibold text-slate-500 dark:text-slate-400 text-center">
                  PLUNIS AI đồng hành gia đình — không thay thế bác sĩ hoặc chuyên gia tâm lý.
                </div>
              )}
            </div>

            {/* Input Footer */}
            {!showHistory && (
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-end gap-2 shrink-0">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập câu hỏi hoặc tâm sự của bạn..."
                  disabled={isSending}
                  className="flex-1 resize-none max-h-28 px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-semibold focus:outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-colors"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isSending || !inputText.trim()}
                  aria-label="Gửi tin nhắn"
                  className="p-3 rounded-2xl bg-amber-400 hover:bg-amber-500 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-amber-950 disabled:text-slate-400 transition-all shrink-0 shadow-sm"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline Video Preview Modal for Verified Sign Videos */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h4 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2 truncate">
                <Play className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">{previewVideo.title}</span>
              </h4>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-black">
              <video
                src={previewVideo.url}
                controls
                autoPlay
                loop
                playsInline
                className="w-full max-h-80 object-contain"
              />
            </div>
            {previewVideo.watchUrl && (
              <div className="p-3 flex justify-end bg-slate-50 dark:bg-slate-900">
                <button
                  onClick={() => {
                    const url = previewVideo.watchUrl;
                    setPreviewVideo(null);
                    navigate(url);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-black"
                >
                  Mở trang video đầy đủ →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SignoryChatbot;
