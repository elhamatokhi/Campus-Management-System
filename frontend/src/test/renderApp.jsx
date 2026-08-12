import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';

export function setStoredAuth(user, token = 'test-token') {
  window.localStorage.setItem('campusEventsAuth', JSON.stringify({ token, user }));
}

export function renderApp({ route = '/', user = null } = {}) {
  if (user) {
    setStoredAuth(user);
  }

  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}
