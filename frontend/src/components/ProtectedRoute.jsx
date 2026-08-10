import { Navigate, useLocation } from 'react-router-dom';
import ErrorState from './ErrorState.jsx';
import LoadingState from './LoadingState.jsx';
import PageShell from './PageShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const location = useLocation();
  const { isAuthenticated, isAdmin, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <PageShell title="Checking access">
        <LoadingState message="Checking your session..." />
      </PageShell>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <PageShell title="Unauthorized">
        <ErrorState
          title="Admin access required"
          message="Your account does not have permission to access this page."
        />
      </PageShell>
    );
  }

  return children;
}

