import { beforeEach, describe, expect, it } from 'vitest';
import {
  getStoredUser,
  getToken,
  removeToken,
  setStoredUser,
  setToken,
} from '../tokenManager';
import { TOKEN_KEY, USER_KEY } from '../../components/Common/constants';

describe('tokenManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and retrieves an authentication token', () => {
    setToken('jwt-token');

    expect(getToken()).toBe('jwt-token');
  });

  it('serializes and retrieves the logged-in user', () => {
    const user = { _id: 'user-1', name: 'Sancia', role: 'member' };

    setStoredUser(user);

    expect(getStoredUser()).toEqual(user);
  });

  it('returns null for malformed stored user data instead of crashing', () => {
    localStorage.setItem(USER_KEY, '{not-valid-json');

    expect(getStoredUser()).toBeNull();
  });

  it('removes both token and user data on logout', () => {
    localStorage.setItem(TOKEN_KEY, 'jwt-token');
    localStorage.setItem(USER_KEY, JSON.stringify({ _id: 'user-1' }));

    removeToken();

    expect(getToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });
});
