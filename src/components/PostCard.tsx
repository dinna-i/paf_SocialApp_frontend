import React from 'react';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { useState } from 'react';

interface User {
  name: string;
  username: string;
  avatar: string;
}

interface PostProps {
  id: number;
  user: User;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
  isCurrentUserPost?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const PostCard: React.FC<PostProps> = ({
  id,
  user,
  content,
  image,
  likes,
  comments,
  timestamp,
  isCurrentUserPost = false,
  onEdit,
  onDelete
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-gray-500 text-xs">{timestamp}</p>
          </div>
        </div>
        
        {isCurrentUserPost && (
          <div className="relative">
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={toggleOptions}
            >
              <MoreHorizontal size={20} />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <button 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                  onClick={() => {
                    if (onEdit) onEdit(id);
                    setShowOptions(false);
                  }}
                >
                  <Edit size={16} className="mr-2" />
                  Edit Post
                </button>
                <button 
                  className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left flex items-center"
                  onClick={() => {
                    if (onDelete) {
                      if (window.confirm('Are you sure you want to delete this post?')) {
                        onDelete(id);
                      }
                    }
                    setShowOptions(false);
                  }}
                >
                  <Trash size={16} className="mr-2" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="px-4 pb-3">
        <p>{content}</p>
      </div>
      
      {image && (
        <div className="aspect-w-16 aspect-h-9">
          <img 
            src={image} 
            alt="Post content" 
            className="object-cover w-full"
          />
        </div>
      )}
      
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500">
              <Heart size={20} />
              <span>{likes}</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
              <MessageCircle size={20} />
              <span>{comments}</span>
            </button>
          </div>
          <button className="text-gray-500 hover:text-blue-500">
            <Bookmark size={20} />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <img 
            src="/api/placeholder/32/32" 
            alt="Your avatar" 
            className="w-8 h-8 rounded-full"
          />
          <input 
            type="text" 
            placeholder="Add a comment..." 
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};