import { Link } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Notice from '../components/Notice.jsx';
import PageShell from '../components/PageShell.jsx';

export default function Login() {
  const [message, setMessage] = useState('');

  return (
    <PageShell
      eyebrow="Login"
      title="Welcome back"
      description="Authentication will be connected to the User Service in a later phase."
    >
      <form
        className="max-w-lg rounded-md border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage('Authentication will be connected in the User Service phase. No login request was sent.');
        }}
      >
        <div className="grid gap-5">
          <Input label="Email address" id="email" type="email" placeholder="student@university.edu" />
          <Input label="Password" id="password" type="password" placeholder="Enter your password" />
          <Button type="submit" className="w-full">
            Login
          </Button>
        </div>
        {message && (
          <div className="mt-5">
            <Notice>{message}</Notice>
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
