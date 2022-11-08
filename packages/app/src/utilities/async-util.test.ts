import * as Sentry from '@sentry/browser';

import { TryCatchOutput, tryCatch } from './async-util';

jest.mock('@sentry/browser');

describe('tryCatch', () => {
  const errorPromise: Promise<string> = new Promise<string>((resolve, reject) => {
    // eslint-disable-next-line no-constant-condition
    if (1 + 1 < 0) {
      resolve('456');
    } else {
      reject(new Error('fail'));
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return data if promise is successful', async () => {
    const noErrorPromise: Promise<string> = new Promise<string>((resolve) => resolve('123'));
    const { data, error }: TryCatchOutput<string> = await tryCatch(noErrorPromise);
    expect(data).toBe('123');
    expect(error).toBeNull();
  });

  it('should not call Sentry.captureException if no error', async () => {
    jest.spyOn(Sentry, 'captureException');
    expect(Sentry.captureException).toHaveBeenCalledTimes(0);
    const noErrorPromise: Promise<string> = new Promise<string>((resolve) => resolve('123'));
    await tryCatch(noErrorPromise);
    expect(Sentry.captureException).toHaveBeenCalledTimes(0);
  });

  it('should return error if promise causes error', async () => {
    const { data, error }: TryCatchOutput<string> = await tryCatch(errorPromise);
    expect(data).toBeNull();
    expect(error).toBeInstanceOf(Error);
  });

  it('should call Sentry.captureException on error', async () => {
    jest.spyOn(Sentry, 'captureException');
    expect(Sentry.captureException).toHaveBeenCalledTimes(0);

    await tryCatch(errorPromise);

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });
});
