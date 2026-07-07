import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AuthProvider} from '../AuthContext';
import useAuth from '../../hooks/useAuth';
import * as authService from '../../services/auth.service';
import {getStoredUser, getToken, setToken} from '../../utils/tokenManager';

vi.mock('../../services/auth.service', () => ({
    getProfile: vi.fn(),
    login: vi.fn(),
    signup: vi.fn(),
    getAllUsers: vi.fn(),
    deleteUser: vi.fn(),
    updateRole: vi.fn(),
    updateUser: vi.fn(),
}));

const currentUser = {_id: 'user-1', name: 'Sancia', email: 'sancia@example.com', role: 'admin'};

const AuthProbe = () => {
    const {loading, user, login, logout} = useAuth();

    return (
        <div>
            <p data-testid="loading">{String(loading)}</p>
            <p data-testid="user">{user?.name || 'anonymous'}</p>
            <button onClick={() => login('sancia@example.com', 'secret123')}>Log in</button>
            <button onClick={logout}>Log out</button>
        </div>
    );
};

describe('AuthProvider integration', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('hydrates the user from the profile endpoint when a token exists', async () => {
        setToken('existing-token');
        authService.getProfile.mockResolvedValue({success: true, user: currentUser});

        render(<AuthProvider><AuthProbe/></AuthProvider>);

        expect(await screen.findByTestId('user')).toHaveTextContent('Sancia');
        expect(authService.getProfile).toHaveBeenCalledTimes(1);
        expect(getStoredUser()).toEqual(currentUser);
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    it('authenticates through the service and persists the returned session', async () => {
        const user = userEvent.setup();
        authService.login.mockResolvedValue({success: true, token: 'new-token', data: {user: currentUser}});

        render(<AuthProvider><AuthProbe/></AuthProvider>);
        await user.click(screen.getByRole('button', {name: 'Log in'}));

        await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Sancia'));
        expect(authService.login).toHaveBeenCalledWith({email: 'sancia@example.com', password: 'secret123'});
        expect(getToken()).toBe('new-token');
        expect(getStoredUser()).toEqual(currentUser);

        await user.click(screen.getByRole('button', {name: 'Log out'}));
        expect(screen.getByTestId('user')).toHaveTextContent('anonymous');
        expect(getToken()).toBeNull();
    });
});
