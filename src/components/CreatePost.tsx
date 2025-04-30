import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Image, Upload } from 'lucide-react';
import postService from '../services/PostService';

const CreatePost: React.FC = () => {
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    
    // Check file limit
    if (media.length + newFiles.length > 3) {
      setError('Maximum 3 files allowed per post');
      return;
    }
    
    // Create preview URLs
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    setMedia([...media, ...newFiles]);
    setPreviews([...previews, ...newPreviews]);
    setError(null);
  };

  const removeFile = (index: number) => {
    const updatedMedia = [...media];
    const updatedPreviews = [...previews];
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(updatedPreviews[index]);
    
    updatedMedia.splice(index, 1);
    updatedPreviews.splice(index, 1);
    
    setMedia(updatedMedia);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim() && media.length === 0) {
      setError('Please add a description or media to your post');
      return;
    }
    
    try {
      setLoading(true);
      await postService.createPost({
        description,
        media: media.length > 0 ? media : undefined
      });
      
      // Clean up preview URLs
      previews.forEach(preview => URL.revokeObjectURL(preview));
      
      // Redirect to home page
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data || 'Failed to create post. Please try again.');
      console.error('Error creating post:', err);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Create New Post</h2>
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
          <div className="mb-4">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
          
          {previews.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="mb-6 flex items-center">
            <label className="flex items-center cursor-pointer text-blue-600 mr-4">
              <Image size={20} className="mr-2" />
              <span>Add Photos</span>
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                accept="image/*"
                className="hidden"
                disabled={media.length >= 3}
              />
            </label>
            <span className="text-sm text-gray-500">
              {media.length}/3 images
            </span>
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              {loading ? 'Posting...' : 'Post'}
              {loading ? null : <Upload size={16} className="ml-2" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;