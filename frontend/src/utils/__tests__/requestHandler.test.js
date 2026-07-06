import { describe, expect, it, vi } from 'vitest';
import requestHandler from '../requestHandler';

describe('requestHandler', () => {
  it('returns API response data for a successful request', async () => {
    const apiCall = vi.fn().mockResolvedValue({ data: { success: true, project: { _id: 'p-1' } } });

    await expect(requestHandler(apiCall)).resolves.toEqual({
      success: true,
      project: { _id: 'p-1' },
    });
    expect(apiCall).toHaveBeenCalledTimes(1);
  });

  it('returns a normalized failure instead of rejecting', async () => {
    const apiCall = vi.fn().mockRejectedValue({
      response: { status: 400, data: { message: 'Name is required' } },
    });

    await expect(requestHandler(apiCall)).resolves.toEqual({
      success: false,
      status: 400,
      message: 'Name is required',
      data: { message: 'Name is required' },
    });
  });
});
