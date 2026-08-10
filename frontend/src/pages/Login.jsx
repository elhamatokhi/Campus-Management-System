import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Notice from '../components/Notice.jsx';
import PageShell from '../components/PageShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = location.state?.from?.pathname || '/events';
  const successMessage = location.state?.message;

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <PageShell
      eyebrow="Login"
      title="Welcome back"
      description="Login with your campus account to manage bookings and profile details."
    >
      <form
        className="max-w-lg rounded-md border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={async (event) => {
          event.preventDefault();
          setError('');
          setIsSubmitting(true);

          const formData = new FormData(event.currentTarget);
          try {
            await login({
              email: formData.get('email'),
              password: formData.get('password'),
            });
            navigate(redirectTo, { replace: true });
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
        {successMessage && !error && (
          <div className="mt-5">
            <Notice>{successMessage}</Notice>
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
