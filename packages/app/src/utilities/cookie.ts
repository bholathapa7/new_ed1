import * as T from '^/types';

const tail: string = 'path=/; domain=.angelswing.io;';

export const getCookie: (key: string) => string | undefined = (key) => {
  const cookies: string[] = `; ${document.cookie}`.split(`; ${key}=`);

  if (cookies.length === 2) return cookies.pop()?.split(';').shift();

  return;
};

/**
 * @desc This function is for setting cookie. Receives key & value.
 */
export const setCookie: (key: string, value: string, expiredAt?: Date) => void = (
  key, value, date,
) => {
  const expiredAt: string = date ? `expires = ${date.toUTCString()};` : '';
  document.cookie = `${key}=${value}; ${expiredAt} ${tail}`;
};

/**
 * @desc This function is for setting cookie with Object. Receives object.
 */
export const setCookieWithObject: (obj: { [K: string]: string }, expiredAt?: Date) => void = (
  obj, expiredAt,
) => Object.keys(obj).forEach((key: string) => setCookie(key, obj[key], expiredAt));

/**
 * @desc This function is for deleting cookie. Receives key or keys.
 */
export const deleteCookie: (...key: Array<string>) => void = (...key) =>
  key.forEach((k: string) => document.cookie = `${k}= ; ${tail} expires=Thu, 01 Jan 1970 00:00:00 GMT`);

/**
 * This function is for setting cloudfront cookie. Receives authedUser in AuthState.
 */
export const setCloudFrontCookie: (cloudFront: T.CloudFront) => void = ({
  policy, signature, keyPairId,
}) => {
  const cookie: T.CookieCloudFront = {
    'CloudFront-Policy': policy,
    'CloudFront-Signature': signature,
    'CloudFront-Key-Pair-Id': keyPairId,
  };
  const expiredAt: Date = new Date();
  expiredAt.setDate(expiredAt.getDate() + 1);

  setCookieWithObject({ ...cookie }, expiredAt); // Use spread for Type Error
};

export const deleteCloudFrontCookie: () => void = () => {
  const keys: Array<keyof T.CookieCloudFront> = ['CloudFront-Key-Pair-Id', 'CloudFront-Policy', 'CloudFront-Signature'];
  deleteCookie(...keys);
};
