import jwtDecode, { JWT } from 'jwt-decode';
import {
  PersistConfig, Transform,
  createTransform,
} from 'redux-persist';
import { default as storage } from 'redux-persist/lib/storage';

import { SerialState, State } from '^/types';

import { deleteCloudFrontCookie, setCloudFrontCookie } from '^/utilities/cookie';

import { RELEASE_VERSION } from '^/constants/data';

const MSEC_IN_SEC: number = 1000;

const stateTransform: Transform<Partial<State['Auth']>, SerialState> = {
  in: ({ authedUser, automaticSignIn }) => ({
    version: RELEASE_VERSION,
    authedUser,
    automaticSignIn,
    DDMSESSION: 'session',
  }),
  out: ({ version, authedUser, automaticSignIn, DDMSESSION }) => {
    if (automaticSignIn === true || DDMSESSION !== undefined) {
      if (authedUser !== undefined) {
        const { exp }: JWT = jwtDecode(authedUser.token);

        if ((exp !== undefined && exp > Date.now() / MSEC_IN_SEC) && version === RELEASE_VERSION) {
          setCloudFrontCookie(authedUser);

          return { version, authedUser, automaticSignIn };
        }
      }
    }
    deleteCloudFrontCookie();

    return {};
  },
};

const persistConfig: PersistConfig<State> = {
  key: 'abc',
  storage,
  transforms: [
    createTransform(stateTransform.in, stateTransform.out, { whitelist: ['Auth'] }),
  ],
  whitelist: [
    'Auth',
    // PlanConfig is always persisted
    // because technically this data is always the same
    // regardless of the pages the user is in.
    // It is also to reduce network calls to backend.
    'PlanConfig',
  ],
};
export default persistConfig;
