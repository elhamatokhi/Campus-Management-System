import { Link } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Notice from '../components/Notice.jsx';
import PageShell from '../components/PageShell.jsx';

export default function Profile() {
  const [message, setMessage] = useState('');

  return (
    <PageShell
      eyebrow="Profile"
      title="Manage your student profile"
      description="Profile editing is shown as a frontend shell and will later connect to the authenticated User Service."
    >
      <div className="mb-6">
        <Link to="/">
          <Button variant="secondary">Back to home</Button>
        </Link>
      </div>
      <form
        className="max-w-2xl rounded-md border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage('Backend integration coming in Phase 3+. Profile changes are not saved yet.');
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Full name" id="profile-name" defaultValue="Alex Morgan" />
          <Input label="Email address" id="profile-email" type="email" defaultValue="alex@university.edu" />
          <Input label="Programme" id="programme" defaultValue="Cloud Computing" />
          <Input label="Year of study" id="year" defaultValue="Final year" />
        </div>
        <Button type="submit" className="mt-6">
          Save profile
        </Button>
        {message && (
          <div className="mt-5">
            <Notice>{message}</Notice>
          </div>
        )}
      </form>
    </PageShell>
  );
}
