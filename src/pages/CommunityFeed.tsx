import { useEffect, useState, useCallback } from 'react';
import { Users, Heart, MessageCircle, Send, Pin, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getSessionId } from '@/lib/storage';
import type { Post, PostComment } from '@/lib/types';
import { AdsterraAd } from '@/components/AdsterraAd';

interface PostWithExtras extends Post {
  comments?: PostComment[];
  likedByMe?: boolean;
}

export function CommunityFeed() {
  const [posts, setPosts] = useState<PostWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commenterNames, setCommenterNames] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const sessionId = getSessionId();

  const loadPosts = useCallback(async () => {
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (!postsData) {
      setLoading(false);
      return;
    }

    const { data: commentsData } = await supabase
      .from('post_comments')
      .select('*')
      .order('created_at', { ascending: true });

    const { data: likesData } = await supabase
      .from('post_likes')
      .select('post_id, session_id');

    const commentsByPost = (commentsData || []).reduce<Record<string, PostComment[]>>((acc, c) => {
      if (!acc[c.post_id]) acc[c.post_id] = [];
      acc[c.post_id].push(c);
      return acc;
    }, {});

    const likedPostIds = new Set(
      (likesData || []).filter((l) => l.session_id === sessionId).map((l) => l.post_id)
    );

    const enriched: PostWithExtras[] = postsData.map((p) => ({
      ...p,
      comments: commentsByPost[p.id] || [],
      likedByMe: likedPostIds.has(p.id),
    }));

    setPosts(enriched);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleLike = async (postId: string, likedByMe: boolean) => {
    if (likedByMe) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('session_id', sessionId);
      await supabase
        .from('posts')
        .update({ likes_count: Math.max(0, (posts.find((p) => p.id === postId)?.likes_count || 0) - 1) })
        .eq('id', postId);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, session_id: sessionId });
      await supabase
        .from('posts')
        .update({ likes_count: (posts.find((p) => p.id === postId)?.likes_count || 0) + 1 })
        .eq('id', postId);
    }
    loadPosts();
  };

  const handleSubmitComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    const author = commenterNames[postId]?.trim() || 'طالب';
    if (!content) return;

    await supabase.from('post_comments').insert({
      post_id: postId,
      author_name: author,
      content,
    });

    setCommentInputs({ ...commentInputs, [postId]: '' });
    setExpandedComments((prev) => new Set([...prev, postId]));
    loadPosts();
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">ساحة المنشورات</h2>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        آخر الأخبار والإعلانات من إدارة المنصة. يمكنك التفاعل مع المنشورات بالإعجاب والتعليق.
      </p>

      <AdsterraAd />

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border transition-all ${
                post.pinned
                  ? 'border-amber-200 dark:border-amber-800/50 ring-1 ring-amber-100 dark:ring-amber-900/30'
                  : 'border-slate-100 dark:border-slate-700'
              }`}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                      إد
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                          {post.author_badge}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                          {post.author_badge}
                        </span>
                        {post.pinned && (
                          <span className="flex items-center gap-0.5 text-amber-500">
                            <Pin className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">{post.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {post.body}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => handleLike(post.id, post.likedByMe || false)}
                    className={`flex items-center gap-1.5 text-sm transition-all ${
                      post.likedByMe
                        ? 'text-red-500'
                        : 'text-slate-500 dark:text-slate-400 hover:text-red-500'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${post.likedByMe ? 'fill-current' : ''}`}
                    />
                    <span>{post.likes_count}</span>
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments?.length || 0} تعليق</span>
                  </button>
                </div>
              </div>

              {/* Comments section */}
              {expandedComments.has(post.id) && (
                <div className="px-5 pb-5 space-y-3">
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-3 space-y-3">
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-300 shrink-0">
                            {comment.author_name.charAt(0)}
                          </div>
                          <div className="flex-1 bg-slate-50 dark:bg-slate-700/30 rounded-xl px-3 py-2">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-0.5">
                              {comment.author_name}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-2">
                        لا توجد تعليقات بعد
                      </p>
                    )}

                    {/* Add comment */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={commenterNames[post.id] || ''}
                        onChange={(e) => setCommenterNames({ ...commenterNames, [post.id]: e.target.value })}
                        placeholder="اسمك"
                        className="w-24 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSubmitComment(post.id);
                        }}
                        placeholder="أضف تعليقاً..."
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleSubmitComment(post.id)}
                        className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
