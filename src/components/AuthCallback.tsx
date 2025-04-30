// src/components/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract token from URL
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    
    if (token) {
      // Store the token in localStorage
      localStorage.setItem('accessToken', token);
      
      // Redirect to home page
      navigate('/home');
    } else {
      // Handle case where no token is provided
      console.error('No token found in redirect URL');
      navigate('/login', { state: { error: 'Authentication failed' } });
    }
  }, [location, navigate]);

  // Show a loading state while processing
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="spinner mb-4">
          {/* You can add a loading spinner here */}
        </div>
        <p>Completing authentication, please wait...</p>
      </div>
    </div>
  );
};

export default AuthCallback;