import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, removeToken } from '../lib/auth';
import { authAPI } from '../lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuthentication = async () => {
      const token = getToken();
      console.log('ProtectedRoute: Token found:', !!token);
      
      // No token means not authenticated
      if (!token) {
        console.log('ProtectedRoute: No token found, redirecting to login');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Verify token with server
        console.log('ProtectedRoute: Verifying token with server...');
        const response = await authAPI.me();
        console.log('ProtectedRoute: Token verification successful:', response.data);
        setIsAuthenticated(true);
      } catch (error: any) {
        console.log('ProtectedRoute: Token verification failed:', error.response?.data || error.message);
        
        // If it's 401 (Unauthorized) or any other authentication error, remove token
        if (error.response?.status === 401 || error.response?.data?.message?.includes('Invalid token')) {
          console.log('ProtectedRoute: Token is invalid, removing and redirecting to login...');
          removeToken();
          setIsAuthenticated(false);
        } else if (error.code === 'ERR_NETWORK' || !error.response) {
          // For network errors, don't redirect - just show a message
          console.log('ProtectedRoute: Network error, keeping token for retry');
          setIsAuthenticated(true); // Keep user logged in during network issues
        } else {
          // For other errors, also remove token to be safe
          console.log('ProtectedRoute: Other error, removing token to be safe');
          removeToken();
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuthentication();
  }, []);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FEE440] mx-auto mb-4"></div>
          <p className="text-gray-500">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute; 