import { Reducer } from 'redux';
import { Epic, combineEpics } from 'redux-observable';
import { Observable, concat } from 'rxjs';
import { AjaxError, ajax } from 'rxjs/ajax';
import { catchError, mergeMap, mergeMapTo, takeUntil } from 'rxjs/operators';

import {
  action as makeAction,
  props,
  union,
} from 'tsdux';
import { ofType } from 'tsdux-observable';

import {
  FinishProps,
} from '../Utils';
import {
  AuthHeader,
  actionsForEpicReload,
  getRequestErrorType,
  makeAuthHeader,
  makeV2APIURL,
  wwwFormUrlEncoded,
} from './API';
import { ChangeAuthedUser } from './Auth';

import * as T from '^/types';


export const ChangeProjectConfig = makeAction(
  'ddm/projectConfig/CHANGE_PROJECT_CONFIG',
  props<{
    readonly config?: T.ProjectConfig;
  }>(),
);
export const PatchProjectConfig = makeAction(
  'ddm/projectConfig/PATCH_PROJECT_CONFIG',
  props<{
    readonly projectId: number;
    readonly config?: Partial<Omit<T.ProjectConfig, 'projectId'>>;
  }>(),
);
export const CancelPatchProjectConfig = makeAction(
  'ddm/projectConfig/CANCEL_PATCH_PROJECT_CONFIG',
);
export const FinishPatchProjectConfig = makeAction(
  'ddm/projects/FINISH_PATCH_PROJECT_CONFIG',
  props<FinishProps>(),
);

const Action = union([
  ChangeProjectConfig,

  PatchProjectConfig,
  CancelPatchProjectConfig,
  FinishPatchProjectConfig,

  // Out-duck actions
  ChangeAuthedUser,
]);

export type Action = typeof Action;


const patchProjectConfigEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(PatchProjectConfig),
  mergeMap(({ projectId, config: rawConfig }) => {
    const URL: string = makeV2APIURL('projects', projectId, 'config');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    const config: T.ProjectConfig = rawConfig === undefined ? {
      projectId,
    } : {
      ...state$.value.ProjectConfigPerUser.config,
      ...rawConfig,
      projectId,
    };

    const body: object = {
      config: JSON.stringify(config),
    };

    const patchProjectConfig$: Observable<any> = ajax.patch(URL, body, {
      ...header,
      ...wwwFormUrlEncoded,
    }).pipe(
      mergeMapTo([FinishPatchProjectConfig({})]),
    );

    return concat(
      patchProjectConfig$,
      [ChangeProjectConfig({ config })],
    ).pipe(
      catchError((ajaxError: AjaxError) => [
        FinishPatchProjectConfig({
          error: getRequestErrorType(ajaxError),
        }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelPatchProjectConfig),
        ),
      ),
    );
  }),
);

export const epic: Epic<Action, Action, T.State> = combineEpics(
  patchProjectConfigEpic,
  /**
   * @todo
   * Add CancelAcceptProject/CancelDenyProject
   */
  actionsForEpicReload<Action>(
    CancelPatchProjectConfig(),
  ),
);
// Redux reducer
const initialState: T.ProjectConfigPerUserState = {
  config: undefined,
  patchProjectConfigStatus: T.APIStatus.IDLE,
};

const reducer: Reducer<T.ProjectConfigPerUserState> = (state = initialState, action: Action) => {
  switch (action.type) {
    case ChangeProjectConfig.type:
      return {
        ...state,
        config: action.config,
      };
    case PatchProjectConfig.type:
      return {
        ...state,
        patchProjectConfigStatus: T.APIStatus.PROGRESS,
      };
    case CancelPatchProjectConfig.type:
      return {
        ...state,
        patchProjectConfigStatus: T.APIStatus.IDLE,
      };
    case FinishPatchProjectConfig.type:
      return {
        ...state,
        patchProjectConfigStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        patchProjectConfigError: action.error,
      };
    default:
      return state;
  }
};

export default reducer;
