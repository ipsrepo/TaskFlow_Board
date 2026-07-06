const catchAsync = require('../../utils/catchAsync');

describe('catchAsync', () => {
  it('passes asynchronous errors to next', async () => {
    const error = new Error('Async failure');
    const next = jest.fn();
    const handler = catchAsync(async () => {
      throw error;
    });

    await handler({}, {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('does not call next when the wrapped handler resolves', async () => {
    const next = jest.fn();
    const handler = catchAsync(async (req) => {
      req.completed = true;
    });
    const req = {};

    await handler(req, {}, next);

    expect(req.completed).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });
});
