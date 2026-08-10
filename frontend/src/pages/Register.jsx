import { Link } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Notice from '../components/Notice.jsx';
import PageShell from '../components/PageShell.jsx';

export default function Register() {
  const [message, setMessage] = useState('');

  return (
    <PageShell
      eyebrow="Register"
      title="Create your student account"
      description="This form is a UI placeholder until registration is implemented in the User Service."
    >
      <form
        className="max-w-2xl rounded-md border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage('Registration will be connected in the User Service phase. No account was created.');
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Full name" id="name" placeholder="Alex Morgan" />
          <Input label="Email address" id="register-email" type="email" placeholder="alex@university.edu" />
          <Input label="Password" id="register-password" type="password" placeholder="Create a password" />
          <Input label="Confirm password" id="confirm-password" type="password" placeholder="Repeat password" />
        </div>
        <Button type="submit" className="mt-6">
          Create account
        </Button>
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
