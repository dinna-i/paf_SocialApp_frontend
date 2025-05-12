import React from 'react';
import { 
  Home, Users, BookOpen, Grid, Bookmark, Settings, MessageSquare, NotebookPen 
} from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <aside className="hidden md:block w-64 pr-6">
      <div className="sticky top-20">
        <div className="mb-6 flex items-center space-x-3">
          <img 
            src="../src/assets/images/Profile.jpg"
            alt="Profile" 
            className="rounded-full w-12 h-12"
          />
          <div>
            <p className="font-semibold">Sam Smith</p>
            <p className="text-gray-500 text-sm">@samsmith</p>
          </div>
        </div>

        <nav className="space-y-2">
          <a href="/home" className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 text-blue-600">
            <Home size={20} />
            <span className="font-medium">Home</span>
          </a>
          {/* <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100">
            <Users size={20} />
            <span>Friends</span>
          </a> */}
          <a href="/chat" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100">
            <MessageSquare size={20} />
            <span>Message</span>
          </a>
          <a href="/create-post" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100">
            <BookOpen size={20} />
            <span>Create Post</span>
          </a>
          {/* <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100">
            <Grid size={20} />
            <span>Explore</span>
          </a> */}
          {/* <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100">
            <Bookmark size={20} />
            <span>Saved</span>
          </a> */}
          <a href="/my-learning-journey" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100">
            <NotebookPen  size={20} />
            <span>Learning Journey</span>
          </a>
          <a href="/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100">
            <Settings size={20} />
            <span>Settings</span>
          </a>
        </nav>
      </div>
    </aside>
  );
};

export default Navbar;
