import * as Sentry from '@sentry/browser';
import { Reducer } from 'redux';
import { Epic, combineEpics } from 'redux-observable';
import { Observable, concat } from 'rxjs';
import { AjaxError, ajax } from 'rxjs/ajax';
import { catchError, filter, map, mergeMap, shareReplay, takeUntil } from 'rxjs/operators';
import {
  action as makeAction,
  props,
  union,
} from 'tsdux';
import { ofType } from 'tsdux-observable';

import * as T from '^/types';
import { deleteCloudFrontCookie, setCloudFrontCookie } from '^/utilities/cookie';
import {
  FinishProps,
} from '../Utils';
import {
  actionsForEpicReload,
  getRequestErrorType,
  jsonContentHeader,
  makeV2APIURL,
} from './API';
import { ShowSignUpTutorialPopup } from './Pages';
import { ChangeLanguage } from './Pages/Common';
import { HEADER_SLUG_PROP } from '^/constants/network';
import { APIToUser, AddUserInfo } from './Users';
import { insertUserToElasticApm } from './vendor/elasticApm';
import { deleteSentryUser, insertUserToSentry } from './vendor/sentry';
import { belongsToPlan } from '^/utilities/plans';

// API releated types
type SignInBody = Pick<T.User, 'email'> & Pick<T.UserPassword, 'password'>;
type SignUpBody = Readonly<
  Pick<T.User, Exclude<T.SignUpFormUserKeys, 'avatar'>> &
  Pick<T.UserPassword, 'password'>> &
  { avatar?: File };

interface SignInResponse {
  readonly data: T.APIAuthUser;
  readonly meta: T.APICloudFront;
}
interface SignUpResponse {
  readonly data: T.APIAuthUser;
}

// Redux actions
/**
 * Auth API action type
 */


export const SignIn = makeAction(
  'ddm/auth/SIGN_IN',
  props<{
    readonly user: SignInBody;
  }>(),
);
export const CancelSignIn = makeAction(
  'ddm/auth/CANCEL_SIGN_IN',
);
export const FinishSignIn = makeAction(
  'ddm/auth/FINISH_SIGN_IN',
  props<FinishProps & {
    readonly errorCode?: number;
  }>(),
);

export const SignUp = makeAction(
  'ddm/auth/SIGN_UP',
  props<{
    readonly user: SignUpBody;
  }>(),
);
export const CancelSignUp = makeAction(
  'ddm/auth/CANCEL_SIGN_UP',
);
export const ResetSignUpAPI = makeAction(
  'ddm/auth/RESET_SIGN_UP_API',
);
export const FinishSignUp = makeAction(
  'ddm/auth/FINISH_SIGN_UP',
  props<FinishProps>(),
);

export const ChangeAuthedUser = makeAction(
  'ddm/auth/CHANGE_AUTHED_USER',
  props<{
    readonly authedUser?: T.AuthState['authedUser'];
  }>(),
);

export const ChangeAuthedUserAfterSignUp = makeAction(
  'ddm/auth/CHANGE_AUTHED_USER_AFTER_SIGN_UP',
);

export const ChangeTempUser = makeAction(
  'ddm/auth/CHANGE_TEMP_USER',
  props<{
    readonly tempUser?: T.AuthState['tempUser'];
  }>(),
);
export const ChangeAutomaticSignIn = makeAction(
  'ddm/auth/CHANGE_AUTOMATIC_SIGN_IN',
  props<{
    readonly automaticSignIn: T.AuthState['automaticSignIn'];
  }>(),
);

export const ChangePathBeforeAuth = makeAction(
  'ddm/auth/CHANGE_PATH_BEFORE_AUTH',
  props<{
    readonly path: T.AuthState['pathBeforeAuth'];
  }>(),
);

const Action = union([
  SignIn,
  CancelSignIn,
  FinishSignIn,

  SignUp,
  CancelSignUp,
  ResetSignUpAPI,
  FinishSignUp,

  ChangeAuthedUser,

  ChangeAuthedUserAfterSignUp,

  ChangeTempUser,

  ChangeAutomaticSignIn,

  ChangePathBeforeAuth,

  // Out-duck actions
  AddUserInfo,
  ChangeLanguage,
  ShowSignUpTutorialPopup,
]);
export type Action = typeof Action;


// Redux-Observable Epics
const signInEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(SignIn),
  mergeMap(({ user: body }) => {
    const slug = state$.value.PlanConfig.config?.slug ?? '';
    const URL: string = belongsToPlan(slug)
      ? makeV2APIURL('plans', slug, 'signin')
      : makeV2APIURL('auth', 'signin');

    // Header needs to be appended with the slug
    // so that BE can check the scope of this request
    // whether it belongs to a plan or even ESS/safety.
    const header = {
      ...jsonContentHeader,
      [HEADER_SLUG_PROP]: slug,
    };

    const response$: Observable<SignInResponse> =
      ajax.post(URL, body, header).pipe(
        map(({ response }): SignInResponse => response),
        shareReplay(1),
      );

    const user$: Observable<T.User> =
      response$.pipe(
        map(({ data }) => APIToUser(data, slug)),
        shareReplay(1),
      );

    user$.subscribe({
      next: ({ id, ...others }) => {
        [insertUserToSentry, insertUserToElasticApm].forEach((fn) => fn({ id: String(id), ...others }));
      },
      error: (e) => Sentry.captureException(e),
    });

    const addUserInfo$: Observable<Action> =
      user$.pipe(
        map((user) => ({ user })),
        map(AddUserInfo),
      );

    const changeAuthedUser$: Observable<Action> =
      response$.pipe(
        map(({ data: { id, attributes: { token } }, meta }) => ({
          id: parseInt(id, 10),
          token,
          policy: meta.cloudFrontPolicy,
          signature: meta.cloudFrontSignature,
          keyPairId: meta.cloudFrontKeyPairId,
        })),
        map((authedUser) => ({ authedUser })),
        map(ChangeAuthedUser),
      );

    const changeLanguage$: Observable<Action> =
      user$.pipe(
        map(({ language }) => language),
        filter((language) => language !== undefined),
        map((language) => ({ language })),
        map(ChangeLanguage),
      );

    return concat(
      addUserInfo$,
      changeAuthedUser$,
      changeLanguage$,
      [
        FinishSignIn({}),
        ShowSignUpTutorialPopup(),
      ],
    ).pipe(
      catchError((ajaxError: AjaxError) => [
        FinishSignIn({
          error: getRequestErrorType(ajaxError),
          errorCode: ajaxError.status,
        }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelSignIn),
        ),
      ),
    );
  }),
);

const signUpEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(SignUp),
  mergeMap((action) => {
    const slug = state$.value.PlanConfig.config?.slug ?? '';
    const URL: string = belongsToPlan(slug)
      ? makeV2APIURL('plans', slug, 'signup')
      : makeV2APIURL('auth', 'signup');

    const formData: FormData = new FormData();
    for (const key of Object.keys(action.user)) {
      const value: string | File | undefined = action.user[key as keyof SignUpBody];
      if (value) {
        formData.append(key, value);
      }
    }

    const response$: Observable<SignUpResponse['data']> =
      ajax.post(URL, formData, { [HEADER_SLUG_PROP]: slug }).pipe(
        map(({ response }): SignUpResponse => response),
        map(({ data }) => data),
        shareReplay(1),
      );

    const addUserInfo$: Observable<Action> =
      response$.pipe(
        map((user) => APIToUser(user, state$.value.PlanConfig.config?.slug)),
        map((user) => ({ user })),
        map(AddUserInfo),
      );

    return concat(
      addUserInfo$,
      [FinishSignUp({})],
    ).pipe(
      catchError((ajaxError: AjaxError) => [
        FinishSignUp({
          error: getRequestErrorType(ajaxError),
        }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelSignUp),
        ),
      ),
    );
  }),
);

const changeAuthedUserEpic: Epic<Action, Action> = (
  action$,
) => action$.pipe(
  ofType(ChangeAuthedUser),
  mergeMap((action) => {
    if (!action.authedUser) {
      deleteSentryUser();
    }

    return [];
  }),
);

export const epic: Epic<Action, Action> = combineEpics(
  signInEpic,
  signUpEpic,
  changeAuthedUserEpic,
  actionsForEpicReload<Action>(
    CancelSignIn(),
    CancelSignUp(),
  ),
);

// Redux reducer
/**
 * @desc
 * There is no deep-level modification for this reducer,
 * so introducing lens does not help restructuring this.
 */
const initialState: T.AuthState = {
  automaticSignIn: false,
  signInStatus: T.APIStatus.IDLE,
  signUpStatus: T.APIStatus.IDLE,
};
const reducer: Reducer<T.AuthState> = (
  state = initialState, action: Action,
) => {
  switch (action.type) {
    case SignIn.type:
      return {
        ...state,
        signInStatus: T.APIStatus.PROGRESS,
        signInError: undefined,
        signInErrorCode: undefined,
      };
    case CancelSignIn.type:
      return {
        ...state,
        signInStatus: T.APIStatus.IDLE,
        signInError: undefined,
        signInErrorCode: undefined,
      };
    case FinishSignIn.type:
      return {
        ...state,
        signInStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        signInError: action.error,
        signInErrorCode: action.errorCode,
      };

    case SignUp.type:
      return {
        ...state,
        signUpStatus: T.APIStatus.PROGRESS,
        signUpError: undefined,
      };
    case CancelSignUp.type:
    case ResetSignUpAPI.type:
      return {
        ...state,
        signUpStatus: T.APIStatus.IDLE,
        signUpError: undefined,
      };
    case FinishSignUp.type:
      return {
        ...state,
        signUpStatus: action.error === undefined ? T.APIStatus.IDLE : T.APIStatus.ERROR,
        signUpError: action.error,
      };

    case ChangeAuthedUser.type: {
      if (action.authedUser) setCloudFrontCookie(action.authedUser);
      else deleteCloudFrontCookie();

      return {
        ...state,
        authedUser: action.authedUser,
      };
    }

    case ChangeAuthedUserAfterSignUp.type:
      return {
        ...state,
        authedUser: state.tempUser ? {
          ...state.tempUser,
          policy: '',
          signature: '',
          keyPairId: '',
        } : undefined,
        tempUser: undefined,
      };

    case ChangeTempUser.type:
      return {
        ...state,
        tempUser: action.tempUser,
      };

    case ChangeAutomaticSignIn.type:
      return {
        ...state,
        automaticSignIn: action.automaticSignIn,
      };

    case ChangePathBeforeAuth.type:
      return {
        ...state,
        pathBeforeAuth: action.path,
      };

    default:
      /**
       * @desc Because of using persist (Rehydrate), the state will be set
       * to be an empty object like this {}
       * To prevent the case, we add a check to return initialState instead
       */
      return Object.keys(state).length === 0 ? initialState : state;
  }
};
export default reducer;
