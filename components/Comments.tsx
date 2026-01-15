'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart, MessageCircle, Send } from 'lucide-react';

interface Comment {
  id: string;
  post_slug: string;
  parent_id: string | null;
  author_name: string;
  author_email: string;
  content: string;
  created_at: string;
  likes_count: number;
  user_has_liked: boolean;
  replies?: Comment[];
}

interface CommentsProps {
  postSlug: string;
  initialComments: Comment[];
}

export default function Comments({ postSlug, initialComments }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Main comment form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Reply form state
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // Get user identifier for likes (using email from localStorage or generate one)
  const getUserIdentifier = () => {
    let identifier = localStorage.getItem('userIdentifier');
    if (!identifier) {
      identifier = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('userIdentifier', identifier);
    }
    return identifier;
  };

  // Submit main comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_slug: postSlug,
          parent_id: null,
          author_name: name,
          author_email: email,
          content: content,
          approved: true
        }
      ])
      .select()
      .single();

    if (error) {
      alert('Error submitting comment: ' + error.message);
    } else {
      // Add new comment to state
      const newComment: Comment = {
        ...data,
        likes_count: 0,
        user_has_liked: false,
        replies: []
      };
      setComments([newComment, ...comments]);

      // Save name and email to localStorage for next time
      localStorage.setItem('commentName', name);
      localStorage.setItem('commentEmail', email);

      // Reset form
      setContent('');
    }

    setLoading(false);
  };

  // Submit reply
  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    setReplyLoading(true);

    // Get saved name and email
    const savedName = localStorage.getItem('commentName') || '';
    const savedEmail = localStorage.getItem('commentEmail') || '';

    if (!savedName || !savedEmail) {
      alert('Please submit a comment first to set your name and email');
      setReplyLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_slug: postSlug,
          parent_id: parentId,
          author_name: savedName,
          author_email: savedEmail,
          content: replyContent,
          approved: true
        }
      ])
      .select()
      .single();

    if (error) {
      alert('Error submitting reply: ' + error.message);
    } else {
      // Add reply to parent comment
      const newReply: Comment = {
        ...data,
        likes_count: 0,
        user_has_liked: false,
        replies: []
      };

      setComments(comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      }));

      // Reset reply form
      setReplyContent('');
      setReplyingTo(null);
    }

    setReplyLoading(false);
  };

  // Toggle like
  const handleLike = async (commentId: string, currentlyLiked: boolean) => {
    const userIdentifier = getUserIdentifier();

    if (currentlyLiked) {
      // Unlike
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_identifier', userIdentifier);

      if (!error) {
        updateCommentLikes(commentId, -1, false);
      }
    } else {
      // Like
      const { error } = await supabase
        .from('comment_likes')
        .insert([
          {
            comment_id: commentId,
            user_identifier: userIdentifier
          }
        ]);

      if (!error) {
        updateCommentLikes(commentId, 1, true);
      }
    }
  };

  // Update likes in state
  const updateCommentLikes = (commentId: string, change: number, liked: boolean) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes_count: comment.likes_count + change,
          user_has_liked: liked
        };
      }
      // Check replies too
      if (comment.replies) {
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                likes_count: reply.likes_count + change,
                user_has_liked: liked
              };
            }
            return reply;
          })
        };
      }
      return comment;
    }));
  };

  // Render a single comment
  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 md:ml-12' : ''} mb-6`}>
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
        {/* Author info */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
            {comment.author_name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900">{comment.author_name}</div>
            <div className="text-sm text-gray-500">
              {new Date(comment.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* Comment content */}
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{comment.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => handleLike(comment.id, comment.user_has_liked)}
            className={`flex items-center gap-1.5 transition ${comment.user_has_liked
              ? 'text-red-600 font-semibold'
              : 'text-gray-600 hover:text-red-600'
              }`}
          >
            <Heart
              className="w-4 h-4"
              fill={comment.user_has_liked ? 'currentColor' : 'none'}
            />
            <span>{comment.likes_count > 0 ? comment.likes_count : 'Like'}</span>
          </button>

          {!isReply && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Reply</span>
            </button>
          )}
        </div>

        {/* Reply form */}
        {replyingTo === comment.id && (
          <div className="mt-4 pt-4 border-t">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleReply(comment.id)}
                disabled={replyLoading || !replyContent.trim()}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send className="w-4 h-4" />
                {replyLoading ? 'Posting...' : 'Post Reply'}
              </button>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-16 pt-8 border-t">
      <h2 className="text-2xl md:text-3xl font-bold mb-8">
        Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
      </h2>

      {/* Comment Form */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8 rounded-xl mb-8 border border-blue-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Join the conversation</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="email"
              placeholder="Your Email (won't be published)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <textarea
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </div>

      {/* Display Comments */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-lg">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
}