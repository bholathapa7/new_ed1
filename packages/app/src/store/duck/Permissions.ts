/* eslint-disable max-lines */
import { LensGenerator, LensS } from '@typed-f/lens';
import _ from 'lodash-es';
import { Reducer } from 'redux';
import { Epic, combineEpics } from 'redux-observable';
import { concat } from 'rxjs';
import { AjaxError, ajax } from 'rxjs/ajax';
import { catchError, map, mergeMap, mergeMapTo, takeUntil } from 'rxjs/operators';
import {
  action as makeAction,
  props,
  union,
} from 'tsdux';
import { ofType } from 'tsdux-observable';

import * as T from '^/types';
import { DEFAULT_USER_FEATURE_PERMISSION } from '^/utilities/withFeatureToggle';
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
import { CloseProjectPagePopup } from './Pages';
import { APIToUser as APIUserToUser, AddUserInfo } from './Users';

// API releated types
interface PostPermissionBody {
  readonly data: Array<Readonly<{
    email: string;
    role: T.PermissionRole;
  }>>;
  language?: T.Language;
}
interface PatchPermissionBody {
  role: T.PermissionRole;
  feature_ess?: boolean;
}

type PartialPermission = Omit<T.Permission, 'projectId'>;

const APIToPartialPermission: (response: T.APIPermission) => PartialPermission = ({
  avatar, createdAt, updatedAt, ...response
}) => ({
  ...response,
  avatar: avatar ? avatar : undefined,
  createdAt: new Date(createdAt),
  updatedAt: new Date(updatedAt),
});

const APIToPermission: (projectId: number, response: T.APIPermission) => T.Permission = (
  projectId, response,
) => ({
  projectId,
  ...APIToPartialPermission(response),
});

const APIPermissionToAPIUser: (response: T.APIPermission) => T.APIUser = ({
  userId, createdAt, ...response
}) => ({
  id: String(userId),
  type: 'users',
  attributes: {
    ...response,
    createdAt: new Date(createdAt),
    featurePermission: DEFAULT_USER_FEATURE_PERMISSION,
  },
});

interface GetPermissionResponse {
  readonly data: Array<T.APIPermission>;
}

// Redux actions


export const GetPermission = makeAction(
  'ddm/permissions/GET_PERMISSION',
  props<{
    projectId: T.Project['id'];
  }>(),
);
export const CancelGetPermission = makeAction(
  'ddm/permissions/CANCEL_GET_PERMISSION',
);
export const FinishGetPermission = makeAction(
  'ddm/permissions/FINISH_GET_PERMISSION',
  props<FinishProps>(),
);

export const PostPermission = makeAction(
  'ddm/permissions/POST_PERMISSION',
  props<{
    projectId: T.Project['id'];
    permissions: PostPermissionBody['data'];
    language?: T.Language;
  }>(),
);
export const CancelPostPermission = makeAction(
  'ddm/permissions/CANCEL_POST_PERMISSION',
);
export const FinishPostPermission = makeAction(
  'ddm/permissions/FINISH_POST_PERMISSION',
  props<FinishProps>(),
);

export const PatchPermission = makeAction(
  'ddm/permissions/PATCH_PERMISSION',
  props<{
    id: T.Permission['id'];
    role: T.Permission['role'];
    feature_ess?: T.Permission['featureEss'];
  }>(),
);
export const CancelPatchPermission = makeAction(
  'ddm/permissions/CANCEL_PATCH_PERMISSION',
);
export const FinishPatchPermission = makeAction(
  'ddm/permissions/FINISH_PATCH_PERMISSION',
  props<FinishProps>(),
);

export const DeletePermission = makeAction(
  'ddm/permissions/DELETE_PERMISSION',
  props<{
    id: T.Permission['id'];
  }>(),
);
export const CancelDeletePermission = makeAction(
  'ddm/permissions/CANCEL_DELETE_PERMISSION',
);
export const FinishDeletePermission = makeAction(
  'ddm/permissions/FINISH_DELETE_PERMISSION',
  props<FinishProps>(),
);

export const AddPermission = makeAction(
  'ddm/permissions/ADD_PERMISSION',
  props<{
    permission: T.Permission | PartialPermission;
  }>(),
);

export const RemovePermission = makeAction(
  'ddm/permissions/REMOVE_PERMISSION',
  props<{
    id: T.Permission['id'];
  }>(),
);

export const UpdateConfirmDeletePermission = makeAction(
  'ddm/permissions/UPDATE_CONFIRM_DELETE_PERMISSION',
  props<{
    id?: T.Permission['id'];
  }>(),
);

const Action = union([
  GetPermission,
  CancelGetPermission,
  FinishGetPermission,

  PostPermission,
  CancelPostPermission,
  FinishPostPermission,

  PatchPermission,
  CancelPatchPermission,
  FinishPatchPermission,

  DeletePermission,
  CancelDeletePermission,
  FinishDeletePermission,

  AddPermission,
  RemovePermission,
  UpdateConfirmDeletePermission,

  // Out-duck actions
  AddUserInfo,
  ChangeAuthedUser,
  CloseProjectPagePopup,
]);
export type Action = typeof Action;


// Redux-Observable Epics
const getPermissionEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetPermission),
  mergeMap(({ projectId }) => {
    const URL: string = makeV2APIURL('projects', projectId, 'permissions');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    return ajax.get(URL, header).pipe(
      map(({ response }): GetPermissionResponse => response),
      mergeMap(({ data }) => [
        ...data
          .map(APIPermissionToAPIUser)
          .map((user) => APIUserToUser(user, state$.value.PlanConfig.config?.slug))
          .map((user) => ({ user }))
          .map(AddUserInfo),
        ...data
          .map((api) => APIToPermission(projectId, api))
          .map((permission) => ({ permission }))
          .map(AddPermission),
      ]),
      (res$) => concat(res$, [FinishGetPermission({})]),
      catchError<Action, any>((ajaxError: AjaxError) => [
        FinishGetPermission({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelGetPermission),
        ),
      ),
    );
  }),
);

const postPermissionEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(PostPermission),
  mergeMap(({ permissions: actionPermissions, projectId, language }) => {
    const URL: string = makeV2APIURL('projects', projectId, 'permissions');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    const body: PostPermissionBody = {
      data: actionPermissions,
      language,
    };

    return ajax.post(URL, body, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }) => response),
      map((data: Array<T.APIPermission>) => data),
      mergeMap((data) => [
        ...data
          .map(APIPermissionToAPIUser)
          .map((user) => APIUserToUser(user, state$.value.PlanConfig.config?.slug))
          .map((user) => ({ user }))
          .map(AddUserInfo),
        ...data
          .map((api) => APIToPermission(projectId, api))
          .map((permission) => ({ permission }))
          .map(AddPermission),
      ]),
      (res$) => concat(res$, [FinishPostPermission({})]),
      catchError<Action, any>((ajaxError: AjaxError) => [
        FinishPostPermission({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelPostPermission),
        ),
      ),
    );
  }),
);

const patchPermissionEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(PatchPermission),
  mergeMap(({ id, role, feature_ess }) => {
    const URL: string = makeV2APIURL('permissions', id);
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }
    const body: PatchPermissionBody = {
      role,
      feature_ess,
    };

    return ajax.patch(URL, body, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }): T.APIPermission => response),
      map(APIToPartialPermission),
      map((permission) => ({ permission })),
      map(AddPermission),
      (res$) => concat(res$, [FinishPatchPermission({})]),
      catchError<Action, any>((ajaxError: AjaxError) => [
        FinishPatchPermission({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelPatchPermission),
        ),
      ),
    );
  }),
);

const deletePermissionEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(DeletePermission),
  mergeMap(({ id }) => {
    const URL: string = makeV2APIURL('permissions', id);
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    return ajax.delete(URL, header).pipe(
      mergeMapTo([
        RemovePermission({ id }),
        UpdateConfirmDeletePermission({}),
        CloseProjectPagePopup(),
        FinishDeletePermission({}),
      ]),
      catchError((ajaxError: AjaxError) => [
        FinishDeletePermission({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelDeletePermission),
        ),
      ),
    );
  }),
);

export const epic: Epic<Action, Action, T.State> = combineEpics(
  getPermissionEpic,
  postPermissionEpic,
  patchPermissionEpic,
  deletePermissionEpic,
  actionsForEpicReload<Action>(
    CancelGetPermission(),
    CancelPostPermission(),
    CancelPatchPermission(),
    CancelDeletePermission(),
  ),
);

export const permissionsStateLens: LensS<T.PermissionsState, T.PermissionsState> =
  new LensGenerator<T.PermissionsState>().fromKeys();

type PermissionsFocusLens<K extends keyof T.PermissionsState> =
  LensS<T.PermissionsState[K], T.PermissionsState>;
const permissionsLens: PermissionsFocusLens<'permissions'> =
  permissionsStateLens.focusTo('permissions');

// Redux reducer
const initialState: T.PermissionsState = {
  permissions: {
    byId: {},
    allIds: [],
  },
  getPermissionsStatus: T.APIStatus.IDLE,
  postPermissionsStatus: T.APIStatus.IDLE,
  patchPermissionStatus: T.APIStatus.IDLE,
  deletePermissionStatus: T.APIStatus.IDLE,
};
const reducer: Reducer<T.PermissionsState> = (
  state = initialState, action: Action,
) => {
  switch (action.type) {
    case GetPermission.type:
      return {
        ...state,
        getPermissionsStatus: T.APIStatus.PROGRESS,
      };
    case CancelGetPermission.type:
      return {
        ...state,
        getPermissionsStatus: T.APIStatus.IDLE,
        getPermissionsError: undefined,
      };
    case FinishGetPermission.type:
      return {
        ...state,
        getPermissionsStatus: action.error === undefined ?
          T.APIStatus.SUCCESS :
          T.APIStatus.ERROR,
        getPermissionsError: action.error,
      };

    case PostPermission.type:
      return {
        ...state,
        postPermissionsStatus: T.APIStatus.PROGRESS,
      };
    case CancelPostPermission.type:
      return {
        ...state,
        postPermissionsStatus: T.APIStatus.IDLE,
        postPermissionsError: undefined,
      };
    case FinishPostPermission.type:
      return {
        ...state,
        postPermissionsStatus: action.error === undefined ?
          T.APIStatus.SUCCESS :
          T.APIStatus.ERROR,
        postPermissionsError: action.error,
      };

    case PatchPermission.type:
      return {
        ...state,
        patchPermissionStatus: T.APIStatus.PROGRESS,
      };
    case CancelPatchPermission.type:
      return {
        ...state,
        patchPermissionStatus: T.APIStatus.IDLE,
        patchPermissionError: undefined,
      };
    case FinishPatchPermission.type:
      return {
        ...state,
        patchPermissionStatus: action.error === undefined ?
          T.APIStatus.SUCCESS :
          T.APIStatus.ERROR,
        patchPermissionError: action.error,
      };

    case DeletePermission.type:
      return {
        ...state,
        deletePermissionStatus: T.APIStatus.PROGRESS,
      };
    case CancelDeletePermission.type:
      return {
        ...state,
        deletePermissionStatus: T.APIStatus.IDLE,
        deletePermissionError: undefined,
      };
    case FinishDeletePermission.type:
      return {
        ...state,
        deletePermissionStatus: action.error === undefined ?
          T.APIStatus.SUCCESS :
          T.APIStatus.ERROR,
        deletePermissionError: action.error,
      };

    case AddPermission.type:
      return permissionsLens
        .map()(state)(({ byId, allIds }) => ({
          byId: {
            ...byId,
            [action.permission.id]: {
              ...byId[action.permission.id],
              ...action.permission,
            },
          },
          allIds: _.orderBy(_.union(allIds, [action.permission.id])),
        }));

    case RemovePermission.type:
      return permissionsLens
        .map()(state)(({ byId, allIds }) => ({
          byId: _.omit(byId, action.id),
          allIds: _.without(allIds, action.id),
        }));

    case UpdateConfirmDeletePermission.type:
      const permissionId: T.Permission['id'] | undefined = action.id;
      if (permissionId === undefined) {
        return {
          ...state,
          confirmDeletePermission: undefined,
        };
      }

      const permission: T.Permission | undefined = state.permissions.byId[permissionId];
      if (permission === undefined) {
        throw new Error(`Invalid permission id: ${permissionId}.`);
      }

      return {
        ...state,
        confirmDeletePermission: permission,
      };

    default:
      return state;
  }
};

export default reducer;
