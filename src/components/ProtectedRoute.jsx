import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextValues';

/**
 * Wraps routes that require authentication.
 * Unauthenticated users are redirected to "/" and the intended path
 * is stored in location.state.from so LoginModal can redirect back.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Wait for Supabase to restore session before deciding
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to home, passing intended path so LoginModal can send them back
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  return children;
}
