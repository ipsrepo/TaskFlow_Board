import {describe, expect, it} from 'vitest';
import {handleApiError} from '../errorHandler';

describe('handleApiError', () => {
    it('normalizes an HTTP error response', () => {
        const error = {
            response: {
                status: 403,
                data: {message: 'You are not allowed to do that.'},
            },
        };

        expect(handleApiError(error)).toEqual({
            success: false,
            status: 403,
            message: 'You are not allowed to do that.',
            data: {message: 'You are not allowed to do that.'},
        });
    });

    it('normalizes a network failure', () => {
        expect(handleApiError({request: {}})).toEqual({
            success: false,
            status: 0,
            message: 'Network error',
        });
    });

    it('uses the thrown message for unexpected client errors', () => {
        expect(handleApiError(new Error('Invalid request configuration'))).toEqual({
            success: false,
            status: 500,
            message: 'Invalid request configuration',
        });
    });
});
