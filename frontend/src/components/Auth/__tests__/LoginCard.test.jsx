import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginCard from '../LoginCard';
import { AuthProvider } from '../../../context/AuthContext';
import * as authService from '../../../services/auth.service';

vi.mock('../../../services/auth.service', () => ({
  getProfile: vi.fn(),
  login: vi.fn(),
  signup: vi.fn(),
  getAllUsers: vi.fn(),
  deleteUser: vi.fn(),
  updateRole: vi.fn(),
  updateUser: vi.fn(),
}));

const renderLogin = () => render(
  <MemoryRouter initialEntries={['/login']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginCard />} />
        <Route path="/dashboard" element={<h1>Dashboard home</h1>} />
      </Routes>
    </AuthProvider>
  </MemoryRouter>,
);

describe('LoginCard integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('shows client-side validation before calling the authentication API', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText('Enter your email address and password.')).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('submits credentials, updates authentication state, and navigates after a successful login', async () => {
    const user = userEvent.setup();
    authService.login.mockResolvedValue({
      success: true,
      token: 'valid-token',
      data: { user: { _id: 'u-1', name: 'Sancia', role: 'member' } },
    });

    renderLogin();

    await user.type(screen.getByLabelText(/email address/i), 'sancia@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('heading', { name: 'Dashboard home' })).toBeInTheDocument();
    expect(authService.login).toHaveBeenCalledWith({
      email: 'sancia@example.com',
      password: 'secret123',
    });
  });

  it('renders the API error when credentials are rejected', async () => {
    const user = userEvent.setup();
    authService.login.mockResolvedValue({ success: false, message: 'Invalid credentials' });
    renderLogin();

    await user.type(screen.getByLabelText(/email address/i), 'sancia@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });
});
