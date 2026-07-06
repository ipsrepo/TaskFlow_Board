const AppError = require('../../utils/appError');

describe('AppError', () => {
  it('creates an operational 4xx error with the expected properties', () => {
    const error = new AppError('Project not found', 404);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Project not found');
    expect(error.statusCode).toBe(404);
    expect(error.status).toBe('failed');
    expect(error.isOperational).toBe(true);
  });

  it('marks 5xx errors with error status', () => {
    const error = new AppError('Database unavailable', 500);

    expect(error.status).toBe('error');
    expect(error.statusCode).toBe(500);
  });
});
