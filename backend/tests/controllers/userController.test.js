jest.mock('../../models/userModel', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock('../../utils/utils', () => ({
  filterObj: jest.fn(),
}));

const User = require('../../models/userModel');
const { filterObj } = require('../../utils/utils');
const userController = require('../../controllers/userController');
const { createResponse } = require('../helpers/http');

describe('userController unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid roles', async () => {
    const res = createResponse();

    await userController.changeRole(
      { params: { id: 'user-2' }, body: { role: 'owner' } },
      res,
      jest.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid role' });
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('returns 404 when changing role for a missing user', async () => {
    User.findByIdAndUpdate.mockResolvedValue(null);
    const res = createResponse();

    await userController.changeRole(
      { params: { id: 'missing-user' }, body: { role: 'lead' } },
      res,
      jest.fn(),
    );

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      'missing-user',
      { role: 'lead' },
      { new: true },
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
  });

  it('updates a valid user role', async () => {
    const user = { _id: 'user-2', role: 'admin' };
    User.findByIdAndUpdate.mockResolvedValue(user);
    const res = createResponse();

    await userController.changeRole(
      { params: { id: 'user-2' }, body: { role: 'admin' } },
      res,
      jest.fn(),
    );

    expect(res.json).toHaveBeenCalledWith({ success: true, user });
  });

  it('blocks password changes through profile update', async () => {
    const next = jest.fn();

    await userController.updateProfile(
      {
        user: { id: 'user-1' },
        body: { password: 'new-password' },
      },
      createResponse(),
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Please use password update, This is for profile only',
        statusCode: 401,
      }),
    );
    expect(filterObj).not.toHaveBeenCalled();
  });

  it('updates only filtered profile fields', async () => {
    filterObj.mockReturnValue({ name: 'Updated Name', email: 'new@example.com' });
    const updatedUser = { _id: 'user-1', name: 'Updated Name', email: 'new@example.com' };
    User.findByIdAndUpdate.mockResolvedValue(updatedUser);
    const res = createResponse();
    const body = {
      name: 'Updated Name',
      email: 'new@example.com',
      role: 'admin',
      password: undefined,
    };

    await userController.updateProfile(
      { user: { id: 'user-1' }, body },
      res,
      jest.fn(),
    );

    expect(filterObj).toHaveBeenCalledWith(body, 'name', 'email');
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      'user-1',
      { name: 'Updated Name', email: 'new@example.com' },
      { new: true, runValidators: true },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: updatedUser });
  });
});
