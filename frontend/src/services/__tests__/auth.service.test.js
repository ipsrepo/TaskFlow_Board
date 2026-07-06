import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../utils/requestHandler', () => ({
  default: vi.fn(),
}));

import api from '../../utils/api';
import requestHandler from '../../utils/requestHandler';
import {
  deleteUser,
  getAllUsers,
  getProfile,
  login,
  signup,
  updateRole,
  updateUser,
} from '../auth.service';

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestHandler.mockImplementation((apiCall) => apiCall());
  });

  it.each([
    ['signup', signup, '/users/signup'],
    ['login', login, '/users/login'],
  ])('sends %s payloads to the correct endpoint through requestHandler', async (_name, service, url) => {
    const payload = { email: 'sancia@example.com', password: 'secret123' };
    const response = { data: { success: true } };
    api.post.mockResolvedValue(response);

    await expect(service(payload)).resolves.toEqual(response);

    expect(requestHandler).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith(url, payload);
  });

  it('gets the users collection and authenticated profile through requestHandler', async () => {
    api.get.mockResolvedValue({ data: { success: true } });

    await getAllUsers();
    await getProfile();

    expect(requestHandler).toHaveBeenCalledTimes(2);
    expect(api.get).toHaveBeenNthCalledWith(1, '/users');
    expect(api.get).toHaveBeenNthCalledWith(2, '/users/profile');
  });

  it('uses the correct role and profile update routes', async () => {
    const profile = { name: 'Sancia Shalom' };
    api.put.mockResolvedValue({ data: { success: true } });

    await updateRole('user-1', 'lead');
    await updateUser(profile);

    expect(api.put).toHaveBeenNthCalledWith(1, '/users/user-1/role', { role: 'lead' });
    expect(api.put).toHaveBeenNthCalledWith(2, '/users/profile', profile);
  });

  it('deletes the requested user through requestHandler', async () => {
    api.delete.mockResolvedValue({ data: { success: true } });

    await deleteUser('user-1');

    expect(requestHandler).toHaveBeenCalledTimes(1);
    expect(api.delete).toHaveBeenCalledWith('/users/user-1');
  });
});
