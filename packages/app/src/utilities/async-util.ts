import * as Sentry from '@sentry/browser';

export interface TryCatchOutput<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Abstraction to make async actions easier.
 */
export async function tryCatch<T>(promise: Promise<T>): Promise<TryCatchOutput<T>> {
  try {
    const data: T = await promise;

    return { data, error: null };
  } catch (error) {
    Sentry.captureException(error);

    return { error, data: null };
  }
}
