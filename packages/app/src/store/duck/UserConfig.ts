import { Reducer } from 'redux';
import { Epic, combineEpics } from 'redux-observable';
import { concat } from 'rxjs';
import { AjaxError, ajax } from 'rxjs/ajax';
import {
  action as makeAction,
  props,
  union,
} from 'tsdux';
import { ofType } from 'tsdux-observable';

import * as T from '^/types';
import { catchError, map, mergeMap, takeUntil } from 'rxjs/operators';
import { FinishProps } from '../Utils';
import { AuthHeader, getRequestErrorType, jsonContentHeader, makeAuthHeader, makeV2APIURL } from './API';
import { ChangeAuthedUser } from './Auth';

interface GetUserConfigResponse {
  readonly data: T.UserConfig | null;
}
interface PatchUserConfigResponse {
  readonly data: T.UserConfig | null;
}
interface PatchUserConfigBody {
  config: string;
}

const APIToUserConfig: (response: T.UserConfig | null) => T.UserConfig | undefined = (
  response,
) => response ? response : undefined;


export const GetUserConfig = makeAction(
  'ddm/userConfig/GET_USER_CONFIG',
);
export const FinishGetUserConfig = makeAction(
  'ddm/userConfig/FINISH_GET_USER_CONFIG',
  props<FinishProps>(),
);
export const CancelGetUserConfig = makeAction(
  'ddm/userConfig/CANCEL_GET_USER_CONFIG',
);

export const PatchUserConfig = makeAction(
  'ddm/userConfig/PATCH_USER_CONFIG',
  props<{
    config?: Partial<T.UserConfig>;
  }>(),
);
export const FinishPatchUserConfig = makeAction(
  'ddm/userConfig/FINISH_PATCH_USER_CONFIG',
  props<FinishProps>(),
);
export const CancelPatchUserConfig = makeAction(
  'ddm/userConfig/PATCH_USER_CONFIG',
);

export const ChangeUserConfig = makeAction(
  'ddm/userConfig/CHANGE_USER_CONFIG',
  props<{
    config?: T.UserConfig;
  }>(),
);

const Action = union([
  GetUserConfig,
  FinishGetUserConfig,
  CancelGetUserConfig,

  PatchUserConfig,
  FinishPatchUserConfig,
  CancelPatchUserConfig,

  ChangeUserConfig,

  ChangeAuthedUser,
]);

export type Action = typeof Action;


// Redux-Observable Epics
const getUserConfigEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetUserConfig),
  mergeMap(() => {
    const URL: string = makeV2APIURL('users', 'config');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    return ajax.get(URL, header).pipe(
      map(({ response }): GetUserConfigResponse => response),
      map(({ data }) => data),
      map(APIToUserConfig),
      map((config) => ChangeUserConfig({ config })),
      (res$) => concat(res$, [FinishGetUserConfig({})]),
      catchError((ajaxError: AjaxError) => [
        FinishGetUserConfig({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelGetUserConfig),
        ),
      ),
    );
  }),
);

const patchUserConfigEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(PatchUserConfig),
  mergeMap(({ config: rawConfig }) => {
    const URL: string = makeV2APIURL('users', 'config');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    const config: T.UserConfig = rawConfig === undefined ? {} : {
      ...state$.value.UserConfig.config,
      ...rawConfig,
    };

    const body: PatchUserConfigBody = {
      config: JSON.stringify(config),
    };

    return ajax.post(URL, body, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }): PatchUserConfigResponse => response),
      map(({ data }) => data),
      map(APIToUserConfig),
      map((responseConfig) => ChangeUserConfig({ config: responseConfig })),
      (res$) => concat(res$, [FinishPatchUserConfig({})]),
      catchError((ajaxError: AjaxError) => [
        FinishPatchUserConfig({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelPatchUserConfig),
        ),
      ),
    );
  }),
);

export const epic: Epic<Action, Action, T.State> = combineEpics(
  getUserConfigEpic,
  patchUserConfigEpic,
);

const initialState: T.UserConfigState = {
  config: undefined,
  getUserConfigStatus: T.APIStatus.IDLE,
  patchUserConfigStatus: T.APIStatus.IDLE,
};

const reducer: Reducer<T.UserConfigState> = (state = initialState, action: Action) => {
  switch (action.type) {
    case GetUserConfig.type:
      return {
        ...state,
        getUserConfigStatus: T.APIStatus.PROGRESS,
      };
    case FinishGetUserConfig.type:
      return {
        ...state,
        getUserConfigStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        getUserConfigError: action.error,
      };
    case CancelGetUserConfig.type:
      return {
        ...state,
        getUserConfigStatus: T.APIStatus.IDLE,
      };

    case PatchUserConfig.type:
      return {
        ...state,
        patchUserConfigStatus: T.APIStatus.PROGRESS,
      };
    case FinishPatchUserConfig.type:
      return {
        ...state,
        patchUserConfigStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        patchUserConfigError: action.error,
      };
    case CancelPatchUserConfig.type:
      return {
        ...state,
        patchUserConfigStatus: T.APIStatus.IDLE,
      };

    case ChangeUserConfig.type:
      return {
        ...state,
        config: action.config,
      };

    default:
      return state;
  }
};

export default reducer;
