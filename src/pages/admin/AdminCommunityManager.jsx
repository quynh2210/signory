import React, { useState, useEffect } from 'react';
import {
  Users,
  Trash2,
  EyeOff,
  Eye,
  Flag,
  MessageCircle,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import {
  getCommunityPosts,
  getAllCommentsAdmin,
  getCommunityReportsAdmin,
  togglePostVisibilityAdmin,
  deleteCommunityPost,
  deleteCommunityComment,
  resolveReportAdmin,
} from '../../services/communityService';

export const AdminCommunityManager = () => {
  const { user } = useAuth();
  const { playClick, playCorrect } = useSound();

  const [tab, setTab] = useState('posts'); // 'posts' | 'comments' | 'reports'
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    const [p, c, r] = await Promise.all([
      getCommunityPosts({ includeHidden: true }),
      getAllCommentsAdmin(),
      getCommunityReportsAdmin(),
    ]);
    setPosts(p);
    setComments(c);
    setReports(r);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      getCommunityPosts({ includeHidden: true }),
      getAllCommentsAdmin(),
      getCommunityReportsAdmin(),
    ]).then(([p, c, r]) => {
      if (!active) return;
      setPosts(p);
      setComments(c);
      setReports(r);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleToggleHidePost = async (post) => {
    const hide = post.status !== 'hidden';
    if (!window.confirm(hide ? 'Ẩn bài viết này khỏi cộng đồng?' : 'Khôi phục hiển thị bài viết này?')) {
      return;
    }
    playClick();
    await togglePostVisibilityAdmin({
      postId: post.id,
      hide,
      adminUid: user.uid,
      reason: hide ? 'Ẩn bởi Quản trị viên' : 'Khôi phục hiển thị',
    });
    playCorrect();
    await loadAll();
  };

  const handleDeletePost = async (post) => {
    if (!window.confirm(`Xác nhận XÓA VĨNH VIỄN bài viết của "${post.authorName}"?`)) return;
    playClick();
    await deleteCommunityPost({
      postId: post.id,
      actorUid: user.uid,
      isAdmin: true,
      reason: 'Xóa bài viết vi phạm tiêu chuẩn cộng đồng',
    });
    playCorrect();
    await loadAll();
  };

  const handleDeleteComment = async (cmt) => {
    if (!window.confirm(`Xác nhận xóa bình luận của "${cmt.authorName}"?`)) return;
    playClick();
    await deleteCommunityComment({
      commentId: cmt.id,
      postId: cmt.postId,
      actorUid: user.uid,
      isAdmin: true,
    });
    playCorrect();
    await loadAll();
  };

  const handleResolveReport = async (repId, status) => {
    playClick();
    await resolveReportAdmin({ reportId: repId, status, adminUid: user.uid });
    playCorrect();
    await loadAll();
  };

  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-600" />
          <span>Quản Trị Cộng Đồng SIGNORY CIRCLE</span>
        </h1>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          Kiểm duyệt bài đăng, hình ảnh/video, bình luận và xử lý báo cáo vi phạm (mọi thao tác được ghi nhật ký).
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-2xl border border-slate-200">
        {[
          { id: 'posts', label: `Bài viết (${posts.length})`, icon: Users },
          { id: 'comments', label: `Bình luận (${comments.length})`, icon: MessageCircle },
          {
            id: 'reports',
            label: `Báo cáo (${pendingReportsCount} chờ xử lý)`,
            icon: Flag,
          },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all ${
                tab === t.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : tab === 'posts' ? (
        <div className="space-y-4">
          {posts.length === 0 && (
            <p className="text-center py-10 text-slate-400 font-semibold bg-white rounded-2xl border border-slate-200">
              Chưa có bài đăng nào trong cộng đồng.
            </p>
          )}
          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-3 ${
                post.status === 'hidden' ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-800">{post.authorName}</span>
                    <span className="text-[11px] font-mono text-slate-400">({post.uid})</span>
                    {post.status === 'hidden' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black">
                        ĐÃ ẨN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-semibold">
                    {post.createdAt ? new Date(post.createdAt).toLocaleString('vi-VN') : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleHidePost(post)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 ${
                      post.status === 'hidden'
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                  >
                    {post.status === 'hidden' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{post.status === 'hidden' ? 'Khôi phục' : 'Ẩn bài'}</span>
                  </button>
                  <button
                    onClick={() => handleDeletePost(post)}
                    className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-black flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-700 whitespace-pre-line">{post.content}</p>

              {post.media?.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {post.media.map((m, i) => (
                    <div key={i} className="rounded-xl overflow-hidden bg-slate-900 aspect-video">
                      {m.resourceType === 'video' ? (
                        <video src={m.url} controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={m.url} alt="Post media" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : tab === 'comments' ? (
        <div className="space-y-3">
          {comments.length === 0 && (
            <p className="text-center py-10 text-slate-400 font-semibold bg-white rounded-2xl border border-slate-200">
              Chưa có bình luận nào.
            </p>
          )}
          {comments.map((cmt) => (
            <div
              key={cmt.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-black text-sm text-slate-800">
                  {cmt.authorName}{' '}
                  <span className="text-xs font-normal text-slate-400">trên bài {cmt.postId}</span>
                </p>
                <p className="text-sm text-slate-600 mt-1">{cmt.content}</p>
              </div>
              <button
                onClick={() => handleDeleteComment(cmt)}
                className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-black flex items-center gap-1 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {reports.length === 0 && (
            <p className="text-center py-10 text-slate-400 font-semibold bg-white rounded-2xl border border-slate-200">
              Không có báo cáo vi phạm nào.
            </p>
          )}
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span className="font-black text-sm text-slate-800">
                    Báo cáo {rep.targetType === 'post' ? 'Bài viết' : 'Bình luận'} ({rep.targetId})
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      rep.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {rep.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-semibold">Lý do: {rep.reason}</p>
                <p className="text-xs text-slate-400">
                  Người báo cáo: {rep.reporterUid} •{' '}
                  {rep.createdAt ? new Date(rep.createdAt).toLocaleString('vi-VN') : ''}
                </p>
              </div>

              {rep.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolveReport(rep.id, 'resolved')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã xử lý
                  </button>
                  <button
                    onClick={() => handleResolveReport(rep.id, 'dismissed')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Bỏ qua
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCommunityManager;
