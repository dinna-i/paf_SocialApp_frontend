import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Save } from 'lucide-react';
import postService from '../services/PostService';

const EditPost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      try {
        setLoading(true);
        const post = await postService.getPostById(parseInt(postId));
        setDescription(post.description);
        setError(null);
      } catch (err) {
        setError('Failed to load post. Please try again.');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postId) return;
    
    if (!description.trim()) {
      setError('Post description cannot be empty');
      return;
    }
    
    try {
      setSaving(true);
      await postService.updatePost(parseInt(postId), {
        description
      });
      
      // Redirect to home page
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data || 'Failed to update post. Please try again.');
      console.error('Error updating post:', err);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Edit Post</h2>
          <button 
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Update your post..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 mr-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              {saving ? 'Saving...' : 'Save Changes'}
              {saving ? null : <Save size={16} className="ml-2" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;