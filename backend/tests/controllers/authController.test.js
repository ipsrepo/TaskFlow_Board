jest.mock('../../models/userModel', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');
const authController = require('../../controllers/authController');
const { createResponse } = require('../helpers/http');

describe('authController unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_TOKEN = 'test-secret';
    process.env.JWT_EXPIRES_IN = '90d';
    process.env.JWT_COOKIE_EXPIRES_IN = '7';
    process.env.NODE_ENV = 'test';
  });

  it('creates a user and returns a JWT on signup', async () => {
    const user = { _id: 'user-1', password: 'hashed-password' };
    User.create.mockResolvedValue(user);
    jwt.sign.mockReturnValue('signed-token');
    const req = {
      body: {
        name: 'Sancia',
        email: 'sancia@example.com',
        password: 'Password123',
        passwordConfirm: 'Password123',
        role: 'member',
      },
    };
    const res = createResponse();

    await authController.signup(req, res, jest.fn());

    expect(User.create).toHaveBeenCalledWith(req.body);
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 'user-1' },
      'test-secret',
      { expiresIn: '90d' },
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'jwt',
      'signed-token',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      token: 'signed-token',
      data: { user: { _id: 'user-1', password: undefined } },
    });
  });

  it('returns a 400 error when login credentials are missing', async () => {
    const next = jest.fn();

    await authController.login({ body: { email: 'sancia@example.com' } }, createResponse(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Please provide email and password',
        statusCode: 400,
      }),
    );
    expect(User.findOne).not.toHaveBeenCalled();
  });


  it('rejects protected routes without a bearer token', async () => {
    const next = jest.fn();

    await authController.protectRoute({ headers: {} }, createResponse(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 }),
    );
  });

  it('blocks roles that are not permitted by restrictTo', () => {
    const next = jest.fn();
    const middleware = authController.restrictTo('admin');

    middleware({ user: { role: 'member' } }, createResponse(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 }),
    );
  });

  it('allows permitted roles through restrictTo', () => {
    const next = jest.fn();
    const middleware = authController.restrictTo('lead', 'admin');

    middleware({ user: { role: 'lead' } }, createResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });
});
