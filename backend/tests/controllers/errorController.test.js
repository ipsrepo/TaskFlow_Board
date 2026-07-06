const AppError = require('../../utils/appError');
const errorController = require('../../controllers/errorController');
const { createResponse } = require('../helpers/http');

describe('errorController unit tests', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('returns full error details in development', () => {
    process.env.NODE_ENV = 'development';
    const error = new AppError('Project not found', 404);
    const res = createResponse();

    errorController(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'failed',
      error,
      message: 'Project not found',
      stack: expect.any(String),
    }));
  });


  it('hides unknown error details in production', () => {
    process.env.NODE_ENV = 'production';
    const res = createResponse();

    errorController(new Error('Database password leaked'), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Something went wrong!',
    });
  });

  it('converts a mongoose CastError into a client-safe 400 error', () => {
    process.env.NODE_ENV = 'production';
    const res = createResponse();
    const error = { name: 'CastError', path: 'id', value: 'not-an-object-id' };

    errorController(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'failed',
      message: 'Invalid id: not-an-object-id',
    });
  });

  it('converts duplicate database fields into a 400 error', () => {
    process.env.NODE_ENV = 'production';
    const res = createResponse();
    const error = { code: 11000, keyValue: { email: 'sancia@example.com' } };

    errorController(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'failed',
      message: 'Duplicate field value: sancia@example.com. Use another value.',
    });
  });

  it('converts invalid and expired JWT errors into 401 responses', () => {
    process.env.NODE_ENV = 'production';

    const invalidRes = createResponse();
    errorController({ name: 'JsonWebTokenError' }, {}, invalidRes, jest.fn());
    expect(invalidRes.status).toHaveBeenCalledWith(401);
    expect(invalidRes.json).toHaveBeenCalledWith({
      status: 'failed',
      message: 'Invalid token, Please login!',
    });

    const expiredRes = createResponse();
    errorController({ name: 'TokenExpiredError' }, {}, expiredRes, jest.fn());
    expect(expiredRes.status).toHaveBeenCalledWith(401);
    expect(expiredRes.json).toHaveBeenCalledWith({
      status: 'failed',
      message: 'Token expired, Please login!',
    });
  });
});
