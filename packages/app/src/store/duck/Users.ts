/* eslint-disable max-lines */
import { LensGenerator, LensS } from '@typed-f/lens';
import _ from 'lodash-es';
import { Reducer } from 'redux';
import { Epic, combineEpics } from 'redux-observable';
import { concat } from 'rxjs';
import { AjaxError, ajax } from 'rxjs/ajax';
import { catchError, map, mapTo, mergeMap, takeUntil } from 'rxjs/operators';
import {
  action as makeAction,
  props,
  union,
} from 'tsdux';
import { ofType } from 'tsdux-observable';

import * as T from '^/types';
import { getFeaturePermissionFromSlug } from '^/utilities/withFeatureToggle';
import {
  FinishProps,
} from '../Utils';
import {
  AuthHeader,
  actionsForEpicReload,
  getRequestErrorType,
  jsonContentHeader,
  makeAuthHeader,
  makeV2APIURL,
} from './API';
import { ChangeAuthedUser } from './Auth';
import { ShowSignUpTutorialPopup } from './Pages';

export const APIToLanguage: (
  language?: string,
) => T.Language | undefined = (
  language,
) => {
  switch (language) {
    case T.Language.KO_KR:
    case T.Language.EN_US:
      return language;
    default:
      return undefined;
  }
};

export const APIToUser: (
  response: T.APIUser, slug: T.PlanConfig['slug']
) => T.User = (
  { id, attributes }, slug,
) => ({
  ...attributes,
  id: Number(id),
  contactNumber: _.defaultTo(attributes.contactNumber, ''),
  organization: _.defaultTo(attributes.organization, ''),
  purpose: _.defaultTo(attributes.purpose, ''),
  country: _.defaultTo(attributes.country, ''),
  language: APIToLanguage(attributes.language),
  avatar: _.defaultTo(attributes.avatar, undefined),
  createdAt: new Date(attributes.createdAt),
  featurePermission: getFeaturePermissionFromSlug(slug),
});

export const APIReleaseToNotice: (
  response: Array<APIRelease> | APIRelease,
) => Array<T.Notice> | T.Notice = (
  release$,
) => Array.isArray(release$) ? release$.map((release: APIRelease) => ({
  id: release.attributes.releaseNote.id,
  type: release.type,
  url: release.attributes.releaseNote.notice_url,
  title: release.attributes.releaseNote.title,
  headings: release.attributes.releaseNote.headings.headings,
  isRead: release.attributes.isRead,
  isShown: release.attributes.isShown,
  isHidden: release.attributes.isHidden,
  createdAt: new Date(release.attributes.releaseNote.released_at),
})) : ({
  id: release$.attributes.releaseNote.id,
  type: release$.type,
  url: release$.attributes.releaseNote.notice_url,
  title: release$.attributes.releaseNote.title,
  headings: release$.attributes.releaseNote.headings.headings,
  isRead: release$.attributes.isRead,
  isShown: release$.attributes.isShown,
  isHidden: release$.attributes.isHidden,
  createdAt: new Date(release$.attributes.releaseNote.released_at),
});

// API releated types
interface GetUserInfoResponse {
  readonly data: T.APIUser;
}
interface PatchUserInfoResponse {
  readonly data: T.APIUser;
}
export interface PatchUserInfoBody extends Partial<
  & Omit<T.MyPageFormValues, 'avatar'>
> {
  readonly currentPassword?: T.UserPassword['password'];
  readonly avatar?: File;
}
export interface PostPasswordResetBody extends Pick<T.User, 'email'> {
  readonly language?: T.Language;
}
interface PatchPasswordBody extends Pick<T.UserPassword, 'password'> {
  readonly token: string;
}

interface APIRelease {
  id: string;
  type: 'userReleaseNotes';
  attributes: {
    isShown: boolean;
    isHidden: boolean;
    isRead: boolean;
    releaseNote: {
      id: number;
      title: string;
      headings: {
        headings: Array<string>;
      };
      notice_url: string;
      released_at: string;
      created_at: string;
      updated_at: string;
    };
  };
}

interface GetNoticeResponse {
  data: Array<APIRelease>;
}

interface PatchNoticeResponse {
  data: APIRelease;
}

interface PatchNoticeBody {
  id: T.Notice['id'];
  isShown?: T.Notice['isShown'];
  isRead?: T.Notice['isRead'];
  isHidden?: T.Notice['isHidden'];
}

// Redux actions

export const GetUserInfo = makeAction(
  'ddm/users/GET_USER_INFO',
  props<{
    readonly user: Pick<T.User, 'id'>;
  }>(),
);
export const CancelGetUserInfo = makeAction(
  'ddm/users/CANCEL_GET_USER_INFO',
);
export const FinishGetUserInfo = makeAction(
  'ddm/users/FINISH_GET_USER_INFO',
  props<FinishProps>(),
);

export const PatchUserInfo = makeAction(
  'ddm/users/PATCH_USER_INFO',
  props<{
    readonly user: Pick<T.User, 'id'> & PatchUserInfoBody;
  }>(),
);
export const CancelPatchUserInfo = makeAction(
  'ddm/users/CANCEL_PATCH_USER_INFO',
);
export const FinishPatchUserInfo = makeAction(
  'ddm/users/FINISH_PATCH_USER_INFO',
  props<FinishProps>(),
);

export const PostPasswordReset = makeAction(
  'ddm/users/POST_PASSWORD_RESET',
  props<{
    readonly resetPasswordRequestData: PostPasswordResetBody;
  }>(),
);
export const CancelPostPasswordReset = makeAction(
  'ddm/users/CANCEL_POST_PASSWORD_RESET',
);
export const FinishPostPasswordReset = makeAction(
  'ddm/users/FINISH_POST_PASSWORD_RESET',
  props<FinishProps>(),
);

export const PatchPassword = makeAction(
  'ddm/users/PATCH_PASSWORD_ACTION',
  props<{
    readonly token: string;
    readonly password: T.UserPassword['password'];
  }>(),
);
export const CancelPatchPassword = makeAction(
  'ddm/users/CANCEL_PATCH_PASSWORD_ACTION',
);
export const FinishPatchPassword = makeAction(
  'ddm/users/FINISH_PATCH_PASSWORD_ACTION',
  props<FinishProps>(),
);

export const AddUserInfo = makeAction(
  'ddm/users/ADD_USER_INFO',
  props<{
    readonly user: T.User;
  }>(),
);

export const ChangeUserInfo = makeAction(
  'ddm/users/CHANGE_USER_INFO',
  props<{
    readonly user: Pick<T.User, 'id'> & Partial<Omit<T.User, 'id'>>;
  }>(),
);

export const RemoveUserInfo = makeAction(
  'ddm/users/REMOVE_USER_INFO_ACTION',
  props<{
    readonly user: Pick<T.User, 'id'>;
  }>(),
);

export const AddNoitces = makeAction(
  'ddm/users/ADD_NOTICES',
  props<{
    readonly notices: Array<T.Notice>;
  }>(),
);
export const ChangeNotice = makeAction(
  'ddm/users/CHANGE_NOTICE',
  props<{
    readonly notice: T.Notice;
  }>(),
);

export const GetNotice = makeAction(
  'ddm/users/GET_NOTICE',
);
export const CancelGetNotice = makeAction(
  'ddm/users/CANCEL_GET_NOTICE',
);
export const FinishGetNotice = makeAction(
  'ddm/users/FINISH_GET_NOTICE',
  props<FinishProps>(),
);
export const PatchNotice = makeAction(
  'ddm/users/PATCH_NOTICE',
  props<{
    readonly notice: T.Notice;
  }>(),
);
export const CancelPatchNotice = makeAction(
  'ddm/users/CANCEL_PATCH_NOTICE',
);
export const FinishPatchNotice = makeAction(
  'ddm/users/FINISH_PATCH_NOTICE',
  props<FinishProps>(),
);

const Action = union([
  GetUserInfo,
  CancelGetUserInfo,
  FinishGetUserInfo,

  PatchUserInfo,
  CancelPatchUserInfo,
  FinishPatchUserInfo,

  PostPasswordReset,
  CancelPostPasswordReset,
  FinishPostPasswordReset,

  PatchPassword,
  CancelPatchPassword,
  FinishPatchPassword,

  AddUserInfo,

  ChangeUserInfo,

  RemoveUserInfo,

  AddNoitces,
  ChangeNotice,

  GetNotice,
  CancelGetNotice,
  FinishGetNotice,

  PatchNotice,
  CancelPatchNotice,
  FinishPatchNotice,

  // Out-duck actions
  ChangeAuthedUser,
  ShowSignUpTutorialPopup,
]);
export type Action = typeof Action;


// Redux-Observable Epics

const getUserInfoEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetUserInfo),
  mergeMap(({ user: { id } }) => {
    const URL: string = makeV2APIURL('users', id);
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    return ajax.get(URL, header).pipe(
      map(({ response }): GetUserInfoResponse => response),
      map(({ data }) => data),
      map((user) => APIToUser(user, state$.value.PlanConfig.config?.slug)),
      map((user) => ({ user })),
      map(AddUserInfo),
      (res$) => concat(res$, [
        FinishGetUserInfo({}),
        ShowSignUpTutorialPopup(),
      ]),
      catchError<Action, any>((ajaxError: AjaxError) => [
        FinishGetUserInfo({
          error: getRequestErrorType(ajaxError),
        }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelGetUserInfo),
        ),
      ),
    );
  }),
);

const patchUserInfoEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(PatchUserInfo),
  mergeMap(({ user: { id, ...body } }) => {
    const URL: string = makeV2APIURL('users', id);
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    const turnBooleanIntoString: (boolVal: boolean) => string = (boolVal) => boolVal ? '1' : '0';

    const formdata: FormData = new FormData();
    Object.keys(body).forEach((key: keyof PatchUserInfoBody) => {
      const val: PatchUserInfoBody[keyof PatchUserInfoBody] = body[key];
      if (val !== undefined) {
        formdata.append(key, (typeof val === 'boolean') ? turnBooleanIntoString(val) : val);
      }
    });

    return ajax.patch(URL, formdata, header).pipe(
      map(({ response }): PatchUserInfoResponse => response),
      map(({ data }) => data),
      map((user) => APIToUser(user, state$.value.PlanConfig.config?.slug)),
      map((user) => ({ user })),
      map(ChangeUserInfo),
      (res$) => concat(res$, [FinishPatchUserInfo({})]),
      catchError<Action, any>((ajaxError: AjaxError) => [
        FinishPatchUserInfo({
          error: getRequestErrorType(ajaxError),
        }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelPatchUserInfo),
        ),
      ),
    );
  }),
);

const postPasswordResetEpic: Epic<Action, Action> = (
  action$,
) => action$.pipe(
  ofType(PostPasswordReset),
  mergeMap(({ resetPasswordRequestData }) => {
    const URL: string = makeV2APIURL('users', 'password');

    return ajax.post(URL, resetPasswordRequestData, jsonContentHeader).pipe(
      mapTo(FinishPostPasswordReset({})),
      catchError((ajaxError: AjaxError) => [
        FinishPostPasswordReset({
          error: getRequestErrorType(ajaxError),
        }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelPostPasswordReset),
        ),
      ),
    );
  }),
);

const patchPasswordEpic: Epic<Action, Action> = (
  action$,
) => action$.pipe(
  ofType(PatchPassword),
  mergeMap(({ token, password }) => {
    const URL: string = makeV2APIURL('users', 'password');

    const body: PatchPasswordBody = {
      token,
      password,
    };

    return ajax.patch(URL, body, jsonContentHeader).pipe(
      mapTo(FinishPatchPassword({})),
      catchError((ajaxError: AjaxError) => [
        FinishPatchPassword({
          error: getRequestErrorType(ajaxError),
        }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelPatchPassword),
        ),
      ),
    );
  }),
);

const getNoticeEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetNotice),
  mergeMap(() => {
    const URL: string = makeV2APIURL('releases', 'get-release-note');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    return ajax.get(URL, header).pipe(
      map(({ response }): GetNoticeResponse => response),
      map(({ data }) => data),
      map(APIReleaseToNotice),
      map((notices) => ({ notices })),
      map(AddNoitces),
      (res$) => concat(res$, [FinishGetNotice({})]),
      catchError((ajaxError: AjaxError) => [
        FinishGetNotice({
          error: getRequestErrorType(ajaxError),
        }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelGetNotice),
        ),
      ),
    );
  }),
);

const patchNoticeEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(PatchNotice),
  mergeMap(({ notice: { id, isHidden, isShown, isRead } }) => {
    const URL: string = makeV2APIURL('releases', 'update-release-note');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const body: PatchNoticeBody = { id, isHidden, isShown, isRead };

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    const formData: FormData = new FormData();
    Object.keys(body).forEach((key: keyof PatchNoticeBody) => {
      const val: PatchNoticeBody[keyof PatchNoticeBody] = body[key];
      if (val !== undefined) {
        formData.append(key, val.toString());
      }
    });

    return ajax.patch(URL, formData, header).pipe(
      map(({ response }): PatchNoticeResponse => response),
      map(({ data }) => data),
      map(APIReleaseToNotice),
      map((notice) => ({ notice })),
      map(ChangeNotice),
      (res$) => concat(res$, [FinishPatchNotice({})]),
      catchError((ajaxError: AjaxError) => [
        FinishPatchNotice({
          error: getRequestErrorType(ajaxError),
        }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelPatchNotice),
        ),
      ),
    );
  }),
);

export const usersStateLens: LensS<T.UsersState, T.UsersState> =
  new LensGenerator<T.UsersState>().fromKeys();

type UsersFocusLens<K extends keyof T.UsersState> =
  LensS<T.UsersState[K], T.UsersState>;
const usersLens: UsersFocusLens<'users'> =
  usersStateLens.focusTo('users');

export const epic: Epic<Action, Action, T.State> = combineEpics(
  getUserInfoEpic,
  patchUserInfoEpic,
  postPasswordResetEpic,
  patchPasswordEpic,
  getNoticeEpic,
  patchNoticeEpic,
  actionsForEpicReload<Action>(
    CancelGetUserInfo(), CancelPatchUserInfo(),
    CancelPostPasswordReset(), CancelPatchPassword(),
    CancelGetNotice(),
  ),
);

// Redux reducer
const initialState: T.UsersState = {
  users: {
    byId: {},
    allIds: [],
  },
  notices: {},
  getUserInfoStatus: T.APIStatus.IDLE,
  patchUserInfoStatus: T.APIStatus.IDLE,
  postPasswordResetStatus: T.APIStatus.IDLE,
  patchPasswordStatus: T.APIStatus.IDLE,
  getNoticeStatus: T.APIStatus.IDLE,
  patchNoticeStatus: T.APIStatus.IDLE,
};
const reducer: Reducer<T.UsersState> = (
  state = initialState, action: Action,
) => {
  switch (action.type) {
    case GetUserInfo.type:
      return {
        ...state,
        getUserInfoStatus: T.APIStatus.PROGRESS,
        getUserInfoError: undefined,
      };
    case CancelGetUserInfo.type:
      return {
        ...state,
        getUserInfoStatus: T.APIStatus.IDLE,
        getUserInfoError: undefined,
      };
    case FinishGetUserInfo.type:
      return {
        ...state,
        getUserInfoStatus: action.error === undefined ?
          T.APIStatus.SUCCESS :
          T.APIStatus.ERROR,
        getUserInfoError: action.error,
      };

    case PatchUserInfo.type:
      return {
        ...state,
        patchUserInfoStatus: T.APIStatus.PROGRESS,
        patchUserInfoError: undefined,
      };
    case CancelPatchUserInfo.type:
      return {
        ...state,
        patchUserInfoStatus: T.APIStatus.IDLE,
        patchUserInfoError: undefined,
      };
    case FinishPatchUserInfo.type:
      return {
        ...state,
        patchUserInfoStatus: action.error === undefined ?
          T.APIStatus.SUCCESS :
          T.APIStatus.ERROR,
        patchUserInfoError: action.error,
      };

    case PostPasswordReset.type:
      return {
        ...state,
        postPasswordResetStatus: T.APIStatus.PROGRESS,
        postPasswordResetError: undefined,
      };
    case CancelPostPasswordReset.type:
      return {
        ...state,
        postPasswordResetStatus: T.APIStatus.IDLE,
        postPasswordResetError: undefined,
      };
    case FinishPostPasswordReset.type:
      return {
        ...state,
        postPasswordResetStatus: action.error === undefined ?
          T.APIStatus.SUCCESS :
          T.APIStatus.ERROR,
        postPasswordResetError: action.error,
      };

    case PatchPassword.type:
      return {
        ...state,
        patchPasswordStatus: T.APIStatus.PROGRESS,
        patchPasswordError: undefined,
      };
    case CancelPatchPassword.type:
      return {
        ...state,
        patchPasswordStatus: T.APIStatus.IDLE,
        patchPasswordError: undefined,
      };
    case FinishPatchPassword.type:
      return {
        ...state,
        patchPasswordStatus: action.error === undefined ?
          T.APIStatus.SUCCESS :
          T.APIStatus.ERROR,
        patchPasswordError: action.error,
      };

    case AddUserInfo.type:
      return usersLens
        .map()(state)(({ byId, allIds }) => ({
          byId: {
            ...byId,
            [action.user.id]: action.user,
          },
          allIds: _.orderBy(_.union([action.user.id], allIds)),
        }));

    case ChangeUserInfo.type:
      return usersLens
        .map()(state)(({ byId, allIds }) => ({
          byId: {
            ...byId,
            [action.user.id]: {
              ...byId[action.user.id],
              ...action.user,
            },
          },
          allIds: _.orderBy(_.union([action.user.id], allIds)),
        }));

    case RemoveUserInfo.type:
      return usersLens
        .map()(state)(({ byId, allIds }) => ({
          byId: _.omit(byId, action.user.id),
          allIds: _.without(allIds, action.user.id),
        }));

    case AddNoitces.type: {
      const allIds: Array<T.Notice['id']> = action.notices.map((notice: T.Notice) => notice.id);

      return {
        ...state,
        notices: {
          ...state.notices,
          ..._.zipObject(allIds, action.notices),
        },
      };
    }

    case ChangeNotice.type:
      return {
        ...state,
        notices: {
          ...state.notices,
          [action.notice.id]: {
            ...action.notice,
          },
        },
      };

    case GetNotice.type:
      return {
        ...state,
        getNoticeStatus: T.APIStatus.PROGRESS,
      };
    case CancelGetNotice.type:
      return {
        ...state,
        getNoticeStatus: T.APIStatus.IDLE,
        getNoticeError: undefined,
      };
    case FinishGetNotice.type:
      return {
        ...state,
        getNoticeStatus: action.error === undefined ?
          T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        getNoticeError: action.error,
      };

    case PatchNotice.type:
      return {
        ...state,
        patchNoticeStatus: T.APIStatus.PROGRESS,
      };

    case CancelPatchNotice.type:
      return {
        ...state,
        patchNoticeStatus: T.APIStatus.IDLE,
        patchNoticeError: undefined,
      };

    case FinishPatchNotice.type:
      return {
        ...state,
        patchNoticeStatus: action.error === undefined ?
          T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        patchNoticeError: action.error,
      };

    default:
      return state;
  }
};

export default reducer;
