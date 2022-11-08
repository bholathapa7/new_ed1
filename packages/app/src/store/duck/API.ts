import jwtDecode, { JWT } from 'jwt-decode';
import { Action } from 'redux';
import { Epic } from 'redux-observable';
import { AjaxError } from 'rxjs/ajax';
import { mergeMap, take } from 'rxjs/operators';
import config from '^/config';

import { RELEASE_VERSION } from '^/constants/data';

import { EPIC_RELOAD } from '^/constants/epic';
import { HEADER_SLUG_PROP } from '^/constants/network';

import { AuthState, HTTPError, PlanConfig, SharedContentsState } from '^/types';

type ActionsForEpicEnd = <A extends Action>(...actions: Array<A>) => Epic<A, any>;
export const actionsForEpicReload: ActionsForEpicEnd = (
  ...actions
) => (
  action$,
) => action$.ofType(EPIC_RELOAD).pipe(
  take(1),
  mergeMap(() => actions),
);

export const getRequestErrorType: (ajaxError: AjaxError) => HTTPError = (
  ajaxError,
) => {
  const HTTPStatusBoundary: number = 100;
  const ClientErrorDigit: number = 4;
  const ServerErrorDigit: number = 5;

  // eslint-disable-next-line no-magic-numbers
  if (ajaxError.status === 409) return HTTPError.CLIENT_OUTDATED_ERROR;

  // One example is when a content is created with inexistent group id.
  // eslint-disable-next-line no-magic-numbers
  if (ajaxError.status === 406) return HTTPError.CLIENT_NOT_ACCEPTED_ERROR;

  // 403 means user is unauthorized to do certain action.
  // This includes logging in to a plan that doesn't belong to them,
  // or accessing a project that doesn't belong to them.
  // eslint-disable-next-line no-magic-numbers
  if (ajaxError.status === 403) return HTTPError.CLIENT_UNAUTHORIZED_ERROR;

  // eslint-disable-next-line no-magic-numbers
  if (ajaxError.status === 404) return HTTPError.CLIENT_NOT_FOUND_ERROR;

  switch (Math.round(ajaxError.status / HTTPStatusBoundary)) {
    case ClientErrorDigit:
      return HTTPError.CLIENT_ERROR;
    case ServerErrorDigit:
      return HTTPError.SERVER_ERROR;
    default:
      return HTTPError.UNKNOWN_ERROR;
  }
};

export interface ContentTypeHeader {
  readonly 'Content-Type': string;
}
export const wwwFormUrlEncoded: ContentTypeHeader = {
  'Content-Type': 'application/x-www-form-urlencoded',
};
export const jsonContentHeader: ContentTypeHeader = {
  'Content-Type': 'application/json',
};

export type AuthHeader = Readonly<{
  Authorization: string;
}>;
export const makeAuthHeader: (state: AuthState, slug?: PlanConfig['slug']) => AuthHeader | undefined = (
  state, slug,
) => {
  if (state.authedUser === undefined) {
    return undefined;
  }

  const jwt: JWT = jwtDecode(state.authedUser.token);
  const msecInSec: number = 1000;

  if (jwt.exp === undefined ||
      jwt.exp <= Date.now() / msecInSec) {
    return undefined;
  }

  return {
    Authorization: state.authedUser.token,
    [HEADER_SLUG_PROP]: slug,
  };
};

export type ShareHeader = Readonly<{
  'Share-Token': string;
}>;
export const makeShareHeader: (state: SharedContentsState) => ShareHeader | undefined = (
  { shareToken },
) => {
  if (shareToken === undefined) {
    return undefined;
  }

  return {
    'Share-Token': shareToken,
  };
};

export type VersionHeader = Readonly<{
  'X-Angelswing-Version': string;
}>;
export const makeVersionHeader: () => VersionHeader = () => ({
  'X-Angelswing-Version': RELEASE_VERSION,
});

export const protocol: string = 'https';
export const version2: string = 'v2';
export const serverHostname: string | undefined = process.env.API_HOSTNAME;
export const volumeServiceHostname: string | undefined = process.env.VCM_HOSTNAME;
export const s3BucketUrl: string | undefined = process.env.S3_BUCKET_URL;

if (config.isBrowser && (!serverHostname || !volumeServiceHostname || !s3BucketUrl)) {
  // eslint-disable-next-line no-console
  console.error('VCM/API/S3 URL not found. Some functionalities might not work. Please check packages/app/config/.env.');
}

/**
 * @todo revert to normal host after screen is done or migrated
 */
export const makeV2APIURL: (
  ...path: Array<string | number>
) => string = (
  ...path
) => `${protocol}://${serverHostname}/${version2}/${path.join('/')}`;

export const makeS3URL: (
  ...path: Array<string | number>
) => string = (
  ...path
) => `${protocol}://${s3BucketUrl}/${path.join('/')}`;

export const makeVolumeAPIURL: (
  ...path: Array<string | number>
) => string = (
  ...path
) => `${protocol}://${volumeServiceHostname}/${path.join('/')}`;
