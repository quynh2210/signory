import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Video,
  Send,
  Trash2,
  Edit3,
  UserPlus,
  UserCheck,
  Bell,
  Flag,
  ShieldCheck,
  Ban,
  Loader2,
  Sparkles,
  X,
  Check,
  CornerDownRight,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { uploadMediaToCloudinary } from '../services/cloudinaryService';
import AtmosphericBackdrop from '../components/common/AtmosphericBackdrop';
import {
  getCommunityPosts,
  createCommunityPost,
  updateOwnCommunityPost,
  deleteCommunityPost,
  toggleLikePost,
  getCommentsForPost,
  addCommentToPost,
  deleteCommunityComment,
  getAllFollows,
  toggleFollowUser,
  getBlockedUserIds,
  blockCommunityUser,
  reportCommunityContent,
  getUserNotifications,
  markNotificationsRead,
} from '../services/communityService';

const COMMUNITY_TAGS = [
  'Hành trình cùng con',
  'Ký hiệu mới học',
  'Đọc truyện tranh',
  'Khoảnh khắc gia đình',
  'Chia sẻ & Động viên',
];

export const CommunityCirclePage = () => {
  const { user, userProfile } = useAuth();
  const { playClick, playCorrect, playIncorrect } = useSound();

  const [posts, setPosts] = useState([]);
  const [follows, setFollows] = useState([]);
  const [blockedIds, setBlockedIds] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [feedTab, setFeedTab] = useState('all'); // 'all' | 'following' | 'mine'
  const [showNotifs, setShowNotifs] = useState(false);

  // Composer state
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState(COMMUNITY_TAGS[0]);
  const [mediaItems, setMediaItems] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [childSafetyConfirmed, setChildSafetyConfirmed] = useState(false);
  const [posting, setPosting] = useState(false);
  const [composerError, setComposerError] = useState(null);

  // Post editing
  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostText, setEditPostText] = useState('');

  // Comments drawer per post
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [loadingCommentsId, setLoadingCommentsId] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [replyingTo, setReplyingTo] = useState(null); // { postId, commentId, authorName }

  // Public profile modal & followers/following list
  const [profileModalUid, setProfileModalUid] = useState(null);
  const [profileFollowTab, setProfileFollowTab] = useState('posts'); // 'posts' | 'followers' | 'following'

  // Report modal
  const [reportTarget, setReportTarget] = useState(null); // { targetType, targetId }
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

  const currentUid = user?.uid;

  useEffect(() => {
    let active = true;
    Promise.all([
      getCommunityPosts(),
      getAllFollows(),
      currentUid ? getBlockedUserIds(currentUid) : Promise.resolve([]),
      currentUid ? getUserNotifications(currentUid) : Promise.resolve([]),
    ]).then(([pList, fList, bIds, nList]) => {
      if (!active) return;
      setPosts(pList);
      setFollows(fList);
      setBlockedIds(bIds);
      setNotifications(nList);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [currentUid]);

  const followingSet = useMemo(() => {
    if (!user) return new Set();
    return new Set(follows.filter((f) => f.followerUid === user.uid).map((f) => f.followingUid));
  }, [follows, user]);

  const authorNameMap = useMemo(() => {
    const map = {};
    posts.forEach((p) => {
      if (p.uid && p.authorName) map[p.uid] = p.authorName;
    });
    if (user && userProfile?.displayName) {
      map[user.uid] = userProfile.displayName;
    }
    return map;
  }, [posts, user, userProfile]);

  const visiblePosts = useMemo(() => {
    return posts.filter((p) => {
      if (blockedIds.includes(p.uid)) return false;
      if (feedTab === 'following') return user && followingSet.has(p.uid);
      if (feedTab === 'mine') return user && p.uid === user.uid;
      return true;
    });
  }, [posts, blockedIds, feedTab, user, followingSet]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenNotifs = async () => {
    playClick();
    const next = !showNotifs;
    setShowNotifs(next);
    if (next && unreadCount > 0 && user) {
      await markNotificationsRead(user.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const handleMediaUpload = async (file) => {
    if (!file) return;
    setUploadingMedia(true);
    setComposerError(null);
    try {
      const res = await uploadMediaToCloudinary(file);
      playCorrect();
      setMediaItems((prev) => [
        ...prev,
        {
          url: res.url,
          publicId: res.publicId,
          resourceType: res.resourceType || (file.type.startsWith('video') ? 'video' : 'image'),
        },
      ]);
    } catch (err) {
      playIncorrect();
      setComposerError('Lỗi tải lên media: ' + err.message);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
      setComposerError('Vui lòng đăng nhập để đăng bài chia sẻ cùng cộng đồng.');
      return;
    }
    setComposerError(null);
    setPosting(true);
    try {
      const newPost = await createCommunityPost({
        uid: user.uid,
        authorName: userProfile?.displayName || user.displayName || 'Gia đình Signory',
        authorRole: userProfile?.role || 'user',
        content,
        media: mediaItems,
        tags: [selectedTag],
        childSafetyConfirmed,
      });
      playCorrect();
      setPosts((prev) => [newPost, ...prev]);
      setContent('');
      setMediaItems([]);
      setChildSafetyConfirmed(false);
    } catch (err) {
      playIncorrect();
      setComposerError(err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleSaveEditPost = async (postId) => {
    try {
      const { updates } = await updateOwnCommunityPost({
        postId,
        uid: user.uid,
        content: editPostText,
      });
      playCorrect();
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...updates } : p)));
      setEditingPostId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteOwnPost = async (postId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài chia sẻ này?')) return;
    playClick();
    try {
      await deleteCommunityPost({ postId, actorUid: user.uid, isAdmin: false });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLike = async (postId) => {
    if (!user) return alert('Vui lòng đăng nhập để thả tim bài viết.');
    playClick();
    try {
      const res = await toggleLikePost({
        postId,
        uid: user.uid,
        userName: userProfile?.displayName || 'Gia đình Signory',
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes: res.likes, likesCount: res.likesCount } : p
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleComments = async (postId) => {
    playClick();
    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null);
      return;
    }
    setOpenCommentsPostId(postId);
    setLoadingCommentsId(postId);
    const list = await getCommentsForPost(postId);
    setCommentsByPost((prev) => ({ ...prev, [postId]: list }));
    setLoadingCommentsId(null);
  };

  const handleAddComment = async (post) => {
    if (!user) return alert('Vui lòng đăng nhập để bình luận.');
    const text = (commentInputs[post.id] || '').trim();
    if (!text) return;

    try {
      const parentId = replyingTo?.postId === post.id ? replyingTo.commentId : null;
      const newCmt = await addCommentToPost({
        postId: post.id,
        postAuthorUid: post.uid,
        uid: user.uid,
        authorName: userProfile?.displayName || 'Gia đình Signory',
        content: text,
        parentCommentId: parentId,
      });
      playCorrect();
      setCommentsByPost((prev) => ({
        ...prev,
        [post.id]: [...(prev[post.id] || []), newCmt],
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
        )
      );
      setCommentInputs((prev) => ({ ...prev, [post.id]: '' }));
      setReplyingTo(null);
    } catch (err) {
      playIncorrect();
      alert(err.message);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Xóa bình luận này?')) return;
    await deleteCommunityComment({ commentId, postId, actorUid: user.uid, isAdmin: false });
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
    }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, commentsCount: Math.max(0, (p.commentsCount || 1) - 1) } : p
      )
    );
  };

  const handleToggleFollow = async (targetUid) => {
    if (!user) return alert('Vui lòng đăng nhập để theo dõi thành viên.');
    playClick();
    try {
      const res = await toggleFollowUser({
        followerUid: user.uid,
        followingUid: targetUid,
        followerName: userProfile?.displayName || 'Gia đình Signory',
      });
      if (res.following) {
        setFollows((prev) => [...prev, { followerUid: user.uid, followingUid: targetUid }]);
      } else {
        setFollows((prev) =>
          prev.filter((f) => !(f.followerUid === user.uid && f.followingUid === targetUid))
        );
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBlockUser = async (targetUid, targetName) => {
    if (!user) return alert('Vui lòng đăng nhập.');
    if (!window.confirm(`Ẩn toàn bộ bài viết và bình luận từ "${targetName}" khỏi bảng tin của bạn?`)) {
      return;
    }
    await blockCommunityUser({ blockerUid: user.uid, blockedUid: targetUid });
    setBlockedIds((prev) => [...prev, targetUid]);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!user) return alert('Vui lòng đăng nhập để báo cáo.');
    if (!reportTarget) return;
    setReporting(true);
    try {
      await reportCommunityContent({
        reporterUid: user.uid,
        targetType: reportTarget.targetType,
        targetId: reportTarget.targetId,
        reason: reportReason,
      });
      playCorrect();
      setReportTarget(null);
      setReportReason('');
      alert('Đã gửi báo cáo tới Quản trị viên để kiểm duyệt. Cảm ơn bạn đã góp phần bảo vệ cộng đồng!');
    } catch (err) {
      alert(err.message);
    } finally {
      setReporting(false);
    }
  };

  const profilePosts = useMemo(() => {
    if (!profileModalUid) return [];
    return posts.filter((p) => p.uid === profileModalUid);
  }, [posts, profileModalUid]);

  const profileFollowers = useMemo(() => {
    if (!profileModalUid) return [];
    return follows.filter((f) => f.followingUid === profileModalUid);
  }, [follows, profileModalUid]);

  const profileFollowing = useMemo(() => {
    if (!profileModalUid) return [];
    return follows.filter((f) => f.followerUid === profileModalUid);
  }, [follows, profileModalUid]);

  return (
    <div className="relative min-h-screen overflow-x-clip py-8 px-4">
      <AtmosphericBackdrop variant="circle" />
      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        {/* Hero Header */}
        <div className="bg-white dark:bg-slate-800 rounded-[32px] p-6 md:p-7 border-2 border-amber-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 text-xs font-black border border-amber-200 dark:border-amber-700">
              <Users className="w-4 h-4" />
              <span>SIGNORY CIRCLE</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">
              Vòng Tròn Kết Nối Gia Đình
            </h1>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 max-w-xl">
              Nơi cha mẹ và người học chia sẻ những ký hiệu mới, câu chuyện nhỏ và động viên nhau mỗi ngày — không chạy đua lượt thích.
            </p>
          </div>

          {/* Notifications + My Profile quick button */}
          {user && (
            <div className="flex items-center gap-2 self-end sm:self-center relative">
              <button
                onClick={handleOpenNotifs}
                className="relative p-3 rounded-2xl bg-amber-100/80 dark:bg-amber-300/20 hover:bg-amber-200 dark:hover:bg-amber-300/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-700/60 transition-all"
                title="Thông báo tương tác"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  playClick();
                  setProfileFollowTab('posts');
                  setProfileModalUid(user.uid);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-amber-200 hover:bg-amber-300 dark:bg-amber-300 dark:hover:bg-amber-200 border border-amber-300 dark:border-amber-400 text-amber-950 font-black text-xs transition-all shadow-sm"
              >
                Hồ sơ của tôi
              </button>

              {/* Notifications Dropdown */}
              {showNotifs && (
                <div className="absolute right-0 top-14 z-30 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-3 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                      Thông báo tương tác
                    </span>
                    <button onClick={() => setShowNotifs(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-xs font-semibold text-slate-400 py-4 text-center">
                      Chưa có thông báo mới.
                    </p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-1.5">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-200"
                        >
                          <p>{n.message}</p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Child Safety Banner */}
        <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Nguyên tắc An toàn Trẻ em:</strong> Không chia sẻ thông tin cá nhân nhạy cảm của trẻ (địa chỉ, trường học, số điện thoại). Chỉ đăng ảnh/video có hình ảnh trẻ em khi có sự đồng ý của cha mẹ hoặc người giám hộ hợp pháp.
          </p>
        </div>

        {/* Post Composer */}
        <form
          onSubmit={handleCreatePost}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <h2 className="font-black text-sm text-slate-800 dark:text-white">
              Chia sẻ khoảnh khắc học ký hiệu của gia đình bạn
            </h2>
          </div>

          {!user ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 text-center">
              Vui lòng đăng nhập ở thanh trên cùng để đăng bài, thả tim, bình luận và theo dõi các gia đình khác.
            </div>
          ) : (
            <>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Hôm nay bạn và bé đã cùng luyện ký hiệu nào? Hãy kể lại câu chuyện nhỏ của mình..."
                className="w-full p-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm font-semibold focus:outline-none focus:border-amber-400 resize-none"
              />

              {/* Tag selector */}
              <div className="flex flex-wrap gap-1.5">
                {COMMUNITY_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-black border transition-all ${
                      selectedTag === tag
                        ? 'bg-amber-200 dark:bg-amber-300 text-amber-950 border-amber-300 dark:border-amber-400 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-amber-50 dark:hover:bg-slate-600'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              {/* Media Previews */}
              {mediaItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {mediaItems.map((m, idx) => (
                    <div key={idx} className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video border border-slate-200 dark:border-slate-600">
                      {m.resourceType === 'video' ? (
                        <video src={m.url} controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={m.url} alt="Upload" className="w-full h-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => setMediaItems((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Child Safety Consent Checkbox when media attached */}
              {mediaItems.length > 0 && (
                <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={childSafetyConfirmed}
                    onChange={(e) => setChildSafetyConfirmed(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200 leading-relaxed">
                    Tôi xác nhận hình ảnh/video này không chứa thông tin nhạy cảm của trẻ em và đã được sự đồng ý của cha mẹ hoặc người giám hộ hợp pháp.
                  </span>
                </label>
              )}

              {composerError && (
                <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{composerError}</span>
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-300/20 dark:hover:bg-amber-300/35 text-amber-950 dark:text-amber-100 border border-amber-200 dark:border-amber-700/60 font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all">
                    {uploadingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 text-amber-700 dark:text-amber-300" />}
                    <span>Thêm ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingMedia}
                      onChange={(e) => e.target.files?.[0] && handleMediaUpload(e.target.files[0])}
                    />
                  </label>
                  <label className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-300/20 dark:hover:bg-amber-300/35 text-amber-950 dark:text-amber-100 border border-amber-200 dark:border-amber-700/60 font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all">
                    {uploadingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4 text-amber-700 dark:text-amber-300" />}
                    <span>Thêm video</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      disabled={uploadingMedia}
                      onChange={(e) => e.target.files?.[0] && handleMediaUpload(e.target.files[0])}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={posting || uploadingMedia}
                  className="px-5 py-2.5 rounded-2xl bg-amber-200 hover:bg-amber-300 dark:bg-amber-300 dark:hover:bg-amber-200 text-amber-950 border border-amber-300 dark:border-amber-400 font-black text-sm flex items-center gap-2 shadow-sm disabled:opacity-60 transition-all"
                >
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Đăng chia sẻ</span>
                </button>
              </div>
            </>
          )}
        </form>

        {/* Feed Filter Tabs */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          {[
            { id: 'all', label: 'Mới nhất' },
            { id: 'following', label: 'Đang theo dõi' },
            { id: 'mine', label: 'Bài của tôi' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playClick();
                setFeedTab(tab.id);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all ${
                feedTab === tab.id
                  ? 'bg-amber-200 dark:bg-amber-300 text-amber-950 border border-amber-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feed List */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 border border-slate-200 dark:border-slate-700 text-center space-y-2">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="font-black text-slate-700 dark:text-slate-200">
              {feedTab === 'following'
                ? 'Bạn chưa theo dõi thành viên nào hoặc họ chưa có bài đăng.'
                : 'Chưa có bài chia sẻ nào. Hãy là gia đình đầu tiên kể câu chuyện của bạn!'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {visiblePosts.map((post) => {
              const isOwn = user && post.uid === user.uid;
              const isLiked = user && (post.likes || []).includes(user.uid);
              const isFollowingAuthor = user && followingSet.has(post.uid);
              const postComments = commentsByPost[post.id] || [];
              const rootComments = postComments.filter((c) => !c.parentCommentId);
              const repliesByParent = postComments.reduce((acc, c) => {
                if (c.parentCommentId) {
                  acc[c.parentCommentId] = acc[c.parentCommentId] || [];
                  acc[c.parentCommentId].push(c);
                }
                return acc;
              }, {});

              return (
                <article
                  key={post.id}
                  className="bg-white dark:bg-slate-800 rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
                >
                  {/* Author Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setProfileFollowTab('posts');
                          setProfileModalUid(post.uid);
                        }}
                        className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-black text-base flex items-center justify-center shadow-sm shrink-0"
                      >
                        {(post.authorName || 'S').charAt(0).toUpperCase()}
                      </button>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              setProfileFollowTab('posts');
                              setProfileModalUid(post.uid);
                            }}
                            className="font-black text-slate-800 dark:text-white text-sm hover:text-emerald-600 dark:hover:text-emerald-400"
                          >
                            {post.authorName}
                          </button>
                          {post.authorRole === 'admin' && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                              SIGNORY Team
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-slate-400">
                          {post.createdAt ? new Date(post.createdAt).toLocaleString('vi-VN') : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isOwn && user && (
                        <button
                          onClick={() => handleToggleFollow(post.uid)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all border ${
                            isFollowingAuthor
                              ? 'bg-amber-200 dark:bg-amber-300 text-amber-950 border-amber-300'
                              : 'bg-amber-50 dark:bg-amber-200/20 text-amber-900 dark:text-amber-100 border-amber-200 dark:border-amber-700/60 hover:bg-amber-100 dark:hover:bg-amber-300/30'
                          }`}
                        >
                          {isFollowingAuthor ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                          <span>{isFollowingAuthor ? 'Đang theo dõi' : 'Theo dõi'}</span>
                        </button>
                      )}

                      {isOwn ? (
                        <>
                          <button
                            onClick={() => {
                              setEditingPostId(post.id);
                              setEditPostText(post.content);
                            }}
                            title="Chỉnh sửa bài viết"
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOwnPost(post.id)}
                            title="Xóa bài viết"
                            className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/60 text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        user && (
                          <>
                            <button
                              onClick={() => setReportTarget({ targetType: 'post', targetId: post.id })}
                              title="Báo cáo bài viết"
                              className="p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/60 text-slate-400 hover:text-amber-600"
                            >
                              <Flag className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleBlockUser(post.uid, post.authorName)}
                              title="Chặn người dùng này"
                              className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/60 text-slate-400 hover:text-red-500"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </>
                        )
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((t, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Content OR Edit Box */}
                  {editingPostId === post.id ? (
                    <div className="space-y-2">
                      <textarea
                        rows={3}
                        value={editPostText}
                        onChange={(e) => setEditPostText(e.target.value)}
                        className="w-full p-3 rounded-2xl border-2 border-emerald-400 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm font-semibold"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingPostId(null)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleSaveEditPost(post.id)}
                          className="px-4 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 dark:bg-amber-300 dark:hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs font-black flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" /> Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    post.content && (
                      <p className="text-slate-700 dark:text-slate-200 text-sm md:text-base font-medium leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                    )
                  )}

                  {/* Media Gallery */}
                  {post.media?.length > 0 && (
                    <div className={`grid gap-2.5 ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {post.media.map((m, idx) => (
                        <div key={idx} className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700">
                          {m.resourceType === 'video' ? (
                            <video
                              src={m.url}
                              controls
                              preload="metadata"
                              playsInline
                              className="w-full max-h-96 object-contain"
                            />
                          ) : (
                            <img
                              src={m.url}
                              alt="Chia sẻ gia đình"
                              loading="lazy"
                              className="w-full max-h-96 object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reactions Bar */}
                  <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                        isLiked
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{post.likesCount || 0} Yêu thích</span>
                    </button>

                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.commentsCount || 0} Bình luận</span>
                    </button>
                  </div>

                  {/* Comments Thread */}
                  <AnimatePresence>
                    {openCommentsPostId === post.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3 overflow-hidden"
                      >
                        {loadingCommentsId === post.id ? (
                          <div className="py-4 flex justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                          </div>
                        ) : rootComments.length === 0 ? (
                          <p className="text-xs font-semibold text-slate-400 text-center py-2">
                            Chưa có bình luận nào. Hãy gửi lời động viên nhé!
                          </p>
                        ) : (
                          <div className="space-y-2.5">
                            {rootComments.map((cmt) => {
                              const replies = repliesByParent[cmt.id] || [];
                              return (
                                <div key={cmt.id} className="space-y-2">
                                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-black text-xs text-slate-800 dark:text-white">
                                        {cmt.authorName}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        {user && (
                                          <button
                                            onClick={() =>
                                              setReplyingTo({
                                                postId: post.id,
                                                commentId: cmt.id,
                                                authorName: cmt.authorName,
                                              })
                                            }
                                            className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 hover:underline"
                                          >
                                            Trả lời
                                          </button>
                                        )}
                                        {user && cmt.uid === user.uid ? (
                                          <button
                                            onClick={() => handleDeleteComment(post.id, cmt.id)}
                                            className="text-red-500 hover:text-red-600"
                                            title="Xóa bình luận"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        ) : (
                                          user && (
                                            <button
                                              onClick={() =>
                                                setReportTarget({ targetType: 'comment', targetId: cmt.id })
                                              }
                                              className="text-slate-400 hover:text-amber-500"
                                              title="Báo cáo bình luận"
                                            >
                                              <Flag className="w-3 h-3" />
                                            </button>
                                          )
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">
                                      {cmt.content}
                                    </p>
                                  </div>

                                  {/* Nested Replies */}
                                  {replies.length > 0 && (
                                    <div className="pl-6 space-y-1.5">
                                      {replies.map((rep) => (
                                        <div
                                          key={rep.id}
                                          className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 flex items-start justify-between gap-2"
                                        >
                                          <div className="flex items-start gap-1.5">
                                            <CornerDownRight className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                            <div>
                                              <span className="font-black text-[11px] text-slate-800 dark:text-white">
                                                {rep.authorName}
                                              </span>
                                              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                {rep.content}
                                              </p>
                                            </div>
                                          </div>
                                          {user && rep.uid === user.uid && (
                                            <button
                                              onClick={() => handleDeleteComment(post.id, rep.id)}
                                              className="text-red-500 shrink-0"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add Comment Input */}
                        {user && (
                          <div className="space-y-1.5">
                            {replyingTo?.postId === post.id && (
                              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-2">
                                <span>Đang trả lời {replyingTo.authorName}</span>
                                <button onClick={() => setReplyingTo(null)} className="underline">
                                  Hủy
                                </button>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <input
                                value={commentInputs[post.id] || ''}
                                onChange={(e) =>
                                  setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                                }
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post)}
                                placeholder="Viết bình luận động viên..."
                                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-semibold"
                              />
                              <button
                                onClick={() => handleAddComment(post)}
                                className="px-3.5 py-2 rounded-xl bg-amber-200 hover:bg-amber-300 dark:bg-amber-300 dark:hover:bg-amber-200 text-amber-950 border border-amber-300 font-black text-xs transition-all"
                              >
                                Gửi
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Public Profile & Follower/Following Modal */}
      {profileModalUid && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setProfileModalUid(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-black text-xl flex items-center justify-center">
                  {(authorNameMap[profileModalUid] || 'G').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-800 dark:text-white">
                    {authorNameMap[profileModalUid] || 'Thành viên SIGNORY'}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {profilePosts.length} bài viết • {profileFollowers.length} người theo dõi • Đang theo dõi {profileFollowing.length}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalUid(null)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {user && profileModalUid !== user.uid && (
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex justify-end">
                <button
                  onClick={() => handleToggleFollow(profileModalUid)}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border ${
                    followingSet.has(profileModalUid)
                      ? 'bg-amber-100 dark:bg-amber-200/30 text-amber-950 dark:text-amber-100 border-amber-300'
                      : 'bg-amber-200 hover:bg-amber-300 dark:bg-amber-300 dark:hover:bg-amber-200 text-amber-950 border-amber-300'
                  }`}
                >
                  {followingSet.has(profileModalUid) ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{followingSet.has(profileModalUid) ? 'Đang theo dõi' : 'Theo dõi gia đình này'}</span>
                </button>
              </div>
            )}

            {/* Sub-tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 px-5 pt-2 gap-4 text-xs font-black">
              {[
                { id: 'posts', label: `Bài viết (${profilePosts.length})` },
                { id: 'followers', label: `Người theo dõi (${profileFollowers.length})` },
                { id: 'following', label: `Đang theo dõi (${profileFollowing.length})` },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setProfileFollowTab(t.id)}
                  className={`pb-2.5 border-b-2 transition-all ${
                    profileFollowTab === t.id
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {profileFollowTab === 'posts' &&
                (profilePosts.length === 0 ? (
                  <p className="text-xs font-semibold text-slate-400 text-center py-6">Chưa có bài đăng nào.</p>
                ) : (
                  profilePosts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1.5"
                    >
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-pre-line">
                        {p.content}
                      </p>
                      <span className="text-[10px] text-slate-400 block">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString('vi-VN') : ''}
                      </span>
                    </div>
                  ))
                ))}

              {profileFollowTab === 'followers' &&
                (profileFollowers.length === 0 ? (
                  <p className="text-xs font-semibold text-slate-400 text-center py-6">Chưa có người theo dõi.</p>
                ) : (
                  profileFollowers.map((f) => (
                    <div key={f.id || f.followerUid} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs font-black text-slate-700 dark:text-slate-200">
                      {authorNameMap[f.followerUid] || f.followerUid}
                    </div>
                  ))
                ))}

              {profileFollowTab === 'following' &&
                (profileFollowing.length === 0 ? (
                  <p className="text-xs font-semibold text-slate-400 text-center py-6">Chưa theo dõi ai.</p>
                ) : (
                  profileFollowing.map((f) => (
                    <div key={f.id || f.followingUid} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 text-xs font-black text-slate-700 dark:text-slate-200">
                      {authorNameMap[f.followingUid] || f.followingUid}
                    </div>
                  ))
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Report Content Modal */}
      {reportTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setReportTarget(null)}
        >
          <form
            onSubmit={handleSubmitReport}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border-2 border-amber-300 dark:border-amber-700 shadow-2xl space-y-4"
          >
            <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Flag className="w-5 h-5 text-amber-500" />
              <span>Báo cáo nội dung không phù hợp</span>
            </h3>
            <textarea
              rows={3}
              required
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Mô tả ngắn gọn lý do báo cáo (ví dụ: thông tin nhạy cảm trẻ em, ngôn từ không phù hợp, spam)..."
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm font-semibold"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setReportTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={reporting}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black disabled:opacity-50"
              >
                {reporting ? 'Đang gửi...' : 'Gửi báo cáo'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommunityCirclePage;
