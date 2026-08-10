import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Notice from '../components/Notice.jsx';
import PageShell from '../components/PageShell.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/events" replace />;
  }

  return (
    <PageShell
      eyebrow="Register"
      title="Create your student account"
      description="Create an account, then log in to book campus events."
    >
      <form
        className="max-w-2xl rounded-md border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={async (event) => {
          event.preventDefault();
          setError('');
          setMessage('');

          const formData = new FormData(event.currentTarget);
          const password = formData.get('password');
          const confirmPassword = formData.get('confirmPassword');

          if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
          }

          setIsSubmitting(true);
          try {
            await register({
              name: formData.get('name'),
              email: formData.get('email'),
              password,
            });
            setMessage('Account created. You can log in now.');
            setTimeout(() => navigate('/login'), 600);
          } catch (apiError) {
            setError(apiError.message);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Input name="name" label="Full name" id="name" placeholder="Alex Morgan" />
          <Input name="email" label="Email address" id="register-email" type="email" placeholder="alex@campus.test" />
          <Input name="password" label="Password" id="register-password" type="password" placeholder="Create a password" />
          <Input name="confirmPassword" label="Confirm password" id="confirm-password" type="password" placeholder="Repeat password" />
        </div>
        <Button type="submit" className="mt-6" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create account'}
        </Button>
        {error && (
          <div className="mt-5">
            <Notice tone="warning">{error}</Notice>
          </div>
        )}
        {message && (
          <div className="mt-5">
            <Notice>{message}</Notice>
          </div>
        )}
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-semibold text-campus-teal hover:text-teal-700" to="/login">
            Login
          </Link>
        </p>
      </form>
    </PageShell>
  );
}
