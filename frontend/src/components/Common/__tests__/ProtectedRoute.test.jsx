import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { AuthContext } from '../../../context/AuthContext';

const renderProtectedRoute = (authValue, roles) => render(
  <AuthContext.Provider value={authValue}>
    <MemoryRouter initialEntries={['/secure']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<ProtectedRoute roles={roles} />}>
          <Route path="/secure" element={<h1>Secure page</h1>} />
        </Route>
        <Route path="/login" element={<h1>Login page</h1>} />
        <Route path="/dashboard" element={<h1>Dashboard page</h1>} />
      </Routes>
    </MemoryRouter>
  </AuthContext.Provider>,
);

describe('ProtectedRoute integration', () => {
  it('shows a loading state while authentication is being resolved', () => {
    renderProtectedRoute({ user: null, loading: true });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects unauthenticated visitors to login', () => {
    renderProtectedRoute({ user: null, loading: false });

    expect(screen.getByRole('heading', { name: 'Login page' })).toBeInTheDocument();
  });

  it('redirects authenticated users without the required role to dashboard', () => {
    renderProtectedRoute({ user: { role: 'member' }, loading: false }, ['admin']);

    expect(screen.getByRole('heading', { name: 'Dashboard page' })).toBeInTheDocument();
  });

  it('renders the nested page for an authorized user', () => {
    renderProtectedRoute({ user: { role: 'admin' }, loading: false }, ['admin']);

    expect(screen.getByRole('heading', { name: 'Secure page' })).toBeInTheDocument();
  });
});
