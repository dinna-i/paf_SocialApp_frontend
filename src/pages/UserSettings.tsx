import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Trash2, ArrowLeft } from 'lucide-react';
import axiosInstance from '../lib/axiosInstance';

const UserSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    userId: 0,
    userName: '',
    email: '',
    bio: '',
    location: '',
    website: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Fetch current user from /me endpoint
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/users/me');
        setUser(response.data.user);
      } catch (err) {
        console.error('Error fetching current user:', err);
        // setError('Failed to load user profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleInputChange = (e : any) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateUser = async (e : any) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await axiosInstance.put(`/users/${user.userId}`, user);
      setSaveSuccess(true);
      
      // Show success message briefly before redirecting
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Error updating user:', err);
    //   setError('Failed to update user profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await axiosInstance.delete(`/users/${user.userId}`);
        
        // Clear token from localStorage
        localStorage.removeItem('accessToken');
        
        // Redirect to login page
        navigate('/login');
        alert('Your account has been successfully deleted.');
      } catch (err) {
        console.error('Error deleting user:', err);
        // setError('Failed to delete account. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Account Settings</h1>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Success message */}
      {saveSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          Profile updated successfully! Redirecting to home...
        </div>
      )}

      {/* User form */}
      <form onSubmit={handleUpdateUser} className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input 
              type="text"
              id="userName"
              name="userName"
              value={user.userName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input 
              type="email"
              id="email"
              name="email"
              value={user.email}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea 
              id="bio"
              name="bio"
              value={user.bio || ''}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-24"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input 
              type="text"
              id="location"
              name="location"
              value={user.location || ''}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input 
              type="url"
              id="website"
              name="website"
              value={user.website || ''}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 space-y-4">
          <button 
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center"
          >
            {saving ? (
              <>
                <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={20} className="mr-2" />
                Save Changes
              </>
            )}
          </button>
          
          <button 
            type="button"
            onClick={handleDeleteUser}
            className="w-full bg-white border border-red-500 text-red-500 py-3 rounded-lg font-medium hover:bg-red-50 transition flex items-center justify-center"
          >
            <Trash2 size={20} className="mr-2" />
            Delete Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserSettings;