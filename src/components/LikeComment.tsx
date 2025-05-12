import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send } from 'lucide-react';
import axiosInstance from '../lib/axiosInstance';

interface Content {
  id: number;
  path: string;
  contentType: string;
  tag: string | null;
  fileName: string;
  fileSize: number;
  fileType: string;
  duration: number | null;
}

interface PostProps {
  postId: number;
  postType: string;
  description: string;
  createdAt: string;
  contents: Content[];
  comments: Comment[];
}

interface Comment {
  id: number;
  userName: string;
  username: string;
  text: string;
  content: string
  likes: number;
}

const LikeComment = ({ postId, postType, description, createdAt, contents, comments }: PostProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0); 
  //const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = () => {
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    setLiked(!liked);
  };

  const submitCommentToAPI = async (content: string) => {
    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post('/comments', {
        postId,
        content,
      });
      
      if (response.status != 201) {
        throw new Error('Failed to submit comment');
      }
      
      const {data} = response
      return data;
    } catch (error) {
      console.error('Error submitting comment:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (commentText.trim() && !isSubmitting) {
      try {
        // Submit to API
        let data = await submitCommentToAPI(commentText);
        
        
        // Update local state (optimistic update)
        const newComment = { 
          id: comments.length + 1, 
          username: 'CurrentUser', 
          text: commentText, 
          likes: 0 
        };
        
        setComments([...comments, newComment]);
        setCommentText('');
      } catch (error) {
        // Handle error - could show an error message to user
        alert('Failed to post comment. Please try again.');
      }
    }
  };

  const handlePostDelete = async () => {
    try {
      const response = await axiosInstance.delete(`/posts/${postId}`);
      if (response.status === 200) {
        // Handle successful deletion (e.g., redirect or show a message)
        alert('Post deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  }

  const handleEditPost = () => {

  }
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCommentSubmit();
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow my-6">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Post Type: {postType}</h3>
          <p className="text-gray-500 text-xs">Posted on {new Date(createdAt).toLocaleString()}</p>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          Edit
        </button>
        <button className="text-gray-500 hover:text-gray-700" onClick={handlePostDelete}>
          Delete
        </button>

        
      </div>

      {/* Description */}
      <div className="p-4">
        <p className="mb-4">{description}</p>

        {/* Render Images */}
        {contents.length > 0 && contents.map(content => (
          <div key={content.id} className="rounded-lg overflow-hidden bg-gray-200 h-64 mb-4">
            <img 
              src={`http://localhost:8084/uploads/${content.path}`} 
              alt={content.fileName} 
              className="w-full h-full object-cover" 
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between text-gray-500 border-t border-b py-2 px-4">
        <button className={`flex items-center ${liked ? 'text-red-500' : ''}`} onClick={handleLike}>
          <Heart size={20} fill={liked ? "currentColor" : "none"} />
          <span className="ml-1">{likeCount}</span>
        </button>
        <button className="flex items-center" onClick={() => setShowComments(!showComments)}>
          <MessageCircle size={20} />
          <span className="ml-1">{comments.length}</span>
        </button>
        <Share2 size={20} />
        <Bookmark size={20} />
      </div>

      {/* Comments */}
      {showComments && (
        <div className="p-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
              <div className="bg-gray-100 rounded-lg p-2 flex-1">
                <p className="font-semibold text-sm">@{comment.username || comment.userName}</p>
                <p className="text-sm">{comment.content || comment.text}</p>
              </div>
            </div>
          ))}

          {/* Add Comment */}
          <div className="flex items-center mt-3">
            <input
              type="text"
              placeholder="Write a comment..."
              className="bg-gray-100 rounded-full px-4 py-2 w-full mr-2"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting}
            />
            <button 
              onClick={handleCommentSubmit} 
              className={`text-blue-600 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LikeComment;