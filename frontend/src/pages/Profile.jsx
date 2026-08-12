import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../components/Button.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Input from '../components/Input.jsx';
import LoadingState from '../components/LoadingState.jsx';
import Notice from '../components/Notice.jsx';
import PageShell from '../components/PageShell.jsx';
import { getProfile, updateProfile } from '../api/userApi.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { token, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getProfile(token)
      .then((response) => setProfile(response.data))
      .catch((apiError) => setError(apiError.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <PageShell
      eyebrow="Profile"
      title="Manage your student profile"
      description="Update your account details."
    >
      <div className="mb-6">
        <Link to="/">
          <Button variant="secondary">Back to home</Button>
        </Link>
      </div>
      {isLoading && <LoadingState message="Loading your profile..." />}
      {!isLoading && error && !profile && <ErrorState title="Could not load profile" message={error} />}
      {profile && <form
        className="max-w-2xl rounded-md border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={async (event) => {
          event.preventDefault();
          setError('');
          setMessage('');
          setIsSubmitting(true);
          const formData = new FormData(event.currentTarget);

          try {
            const response = await updateProfile(token, {
              name: formData.get('name'),
              email: formData.get('email'),
            });
            setProfile(response.data);
            setUser(response.data);
            setMessage('Profile updated.');
          } catch (apiError) {
            setError(apiError.message);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Input name="name" label="Full name" id="profile-name" defaultValue={profile.name} />
          <Input name="email" label="Email address" id="profile-email" type="email" defaultValue={profile.email} />
          <Input label="Role" id="role" value={profile.role} readOnly />
          <Input label="User ID" id="user-id" value={profile.id} readOnly />
        </div>
        <Button type="submit" className="mt-6" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save profile'}
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
      </form>}
    </PageShell>
  );
}
