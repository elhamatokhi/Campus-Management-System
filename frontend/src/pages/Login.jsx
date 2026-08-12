import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Notice from '../components/Notice.jsx';
import PageShell from '../components/PageShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, user } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState('');
  const requestedPath = location.state?.from?.pathname;
  const isLogoutRedirect = location.state?.loggedOut === true;

  useEffect(() => {
    if (!isLogoutRedirect) return;

    setLogoutMessage('You have been logged out successfully.');
    navigate('/login', { replace: true, state: null });
  }, [isLogoutRedirect, navigate]);

  useEffect(() => {
    if (!logoutMessage) return undefined;

    const timer = window.setTimeout(() => {
      setLogoutMessage('');
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [logoutMessage]);

  if (isAuthenticated && !isLogoutRedirect && !logoutMessage) {
    return <Navigate to={requestedPath || (user?.role === 'ADMIN' ? '/' : '/events')} replace />;
  }

  return (
    <PageShell
      eyebrow="Login"
      title="Welcome back"
      description="Login with your campus account to manage bookings and profile details."
    >
      {logoutMessage && (
        <div className="mb-6 max-w-lg rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-900 shadow-sm">
          {logoutMessage}
        </div>
      )}

      <form
        className="max-w-lg rounded-md border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={async (event) => {
          event.preventDefault();
          setError('');
          setIsSubmitting(true);

          const formData = new FormData(event.currentTarget);
          try {
            const authData = await login({
              email: formData.get('email'),
              password: formData.get('password'),
            });
            navigate(requestedPath || (authData.user?.role === 'ADMIN' ? '/' : '/events'), { replace: true });
          } catch (apiError) {
            setError(apiError.message);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <div className="grid gap-5">
          <Input name="email" label="Email address" id="email" type="email" placeholder="student@campus.test" />
          <Input name="password" label="Password" id="password" type="password" placeholder="Enter your password" />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </div>
        {error && (
          <div className="mt-5">
            <Notice tone="warning">{error}</Notice>
          </div>
        )}
        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link className="font-semibold text-campus-teal hover:text-teal-700" to="/register">
            Register
          </Link>
        </p>
      </form>
    </PageShell>
  );
}
