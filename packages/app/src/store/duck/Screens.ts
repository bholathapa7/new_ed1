/* eslint-disable max-lines */
import { produce } from 'immer';
import _ from 'lodash-es';
import { Reducer } from 'redux';
import { Epic, combineEpics } from 'redux-observable';
import { AjaxError, ajax } from 'rxjs/ajax';
import { catchError, map, mergeMap, mergeMapTo, takeUntil } from 'rxjs/operators';
import { action as makeAction, props, union } from 'tsdux';
import { ofType } from 'tsdux-observable';

import * as T from '^/types';
import { formatWithOffset } from '^/utilities/date-format';
import { getSortedScreens } from '^/utilities/screen-util';
import { FinishProps } from '../Utils';
import { AuthHeader, getRequestErrorType, jsonContentHeader, makeAuthHeader, makeV2APIURL } from './API';
import { ChangeAuthedUser } from './Auth';
import { ChangeProjectConfig, PatchProjectConfig } from './ProjectConfig';


export const GetScreens = makeAction(
  'ddm/screens/GET_SCREENS',
  props<{
    readonly projectId: T.Project['id'];
  }>(),
);
export const CancelGetScreens = makeAction(
  'ddm/screens/CANCEL_GET_SCREENS',
);
export const FinishGetScreens = makeAction(
  'ddm/screens/FINISH_GET_SCREENS',
  props<FinishProps>(),
);

export const GetScreen = makeAction(
  'ddm/screens/GET_SCREEN',
  props<{
      readonly screenId: T.Screen['id'];
    }>(),
);
export const CancelGetScreen = makeAction(
  'ddm/screens/CANCEL_GET_SCREEN',
);
export const FinishGetScreen = makeAction(
  'ddm/screens/FINISH_GET_SCREEN',
  props<FinishProps>(),
);

interface PostScreenRequestBody {
  title?: string;
  appearAt?: string;
  contentIds?: Array<T.Content['id']>;
}

export const PostScreen = makeAction(
  'ddm/screens/POST_SCREEN',
  props<{
    readonly title?: string;
    readonly appearAt?: Date;
    readonly contentIds?: Array<T.Content['id']>;
  }>(),
);
export const CancelPostScreen = makeAction(
  'ddm/screens/CANCEL_POST_SCREEN',
);
export const FinishPostScreen = makeAction(
  'ddm/screens/FINISH_POST_SCREEN',
  props<FinishProps>(),
);

interface PatchScreenRequestBody {
  title?: string;
  appearAt?: string;
  updatedAt?: string;
}

export const PatchScreen = makeAction(
  'ddm/screens/PATCH_SCREEN',
  props<{
    readonly screenId: T.Screen['id'];
    readonly title?: string;
    readonly appearAt?: Date;
    readonly updatedAt?: Date;
  }>(),
);
export const CancelPatchScreen = makeAction(
  'ddm/screens/CANCEL_PATCH_SCREEN',
);
export const FinishPatchScreen = makeAction(
  'ddm/screens/FINISH_PATCH_SCREEN',
  props<FinishProps>(),
);

export const DeleteScreen = makeAction(
  'ddm/screens/DELETE_SCREEN',
  props<{
    readonly screenId: T.Screen['id'];
  }>(),
);
export const CancelDeleteScreen = makeAction(
  'ddm/screens/CANCEL_DELETE_SCREEN',
);
export const FinishDeleteScreen = makeAction(
  'ddm/screens/FINISH_DELETE_SCREEN',
  props<FinishProps>(),
);

/**
 * @desc Followings are In-store action
 */
export const SetScreensInStore = makeAction(
  'ddm/screens/SET_SCREENS_IN_STORE',
  props<{
    readonly screens: Array<T.Screen>;
  }>(),
);
export const AddScreenInStore = makeAction(
  'ddm/screens/ADD_SCREEN_IN_STORE',
  props<{
    readonly screen: T.Screen;
  }>(),
);
export const UpdateScreenInStore = makeAction(
  'ddm/screens/UPDATE_SCREEN_IN_STORE',
  props<{
    readonly screen: T.Screen;
  }>(),
);
export const DeleteScreenInStore = makeAction(
  'ddm/screens/DELETE_SCREEN_IN_STORE',
  props<{
    readonly screenId: T.Screen['id'];
  }>(),
);
export const ResetScreensAPIStatusInStore = makeAction(
  'ddm/screens/RESET_SCREENS_API_STATUS',
  props<{}>(),
);


const Action = union([
  GetScreen,
  CancelGetScreen,
  FinishGetScreen,

  GetScreens,
  CancelGetScreens,
  FinishGetScreens,

  PostScreen,
  CancelPostScreen,
  FinishPostScreen,

  PatchScreen,
  CancelPatchScreen,
  FinishPatchScreen,

  DeleteScreen,
  CancelDeleteScreen,
  FinishDeleteScreen,

  ChangeAuthedUser,
  PatchProjectConfig,

  SetScreensInStore,
  AddScreenInStore,
  UpdateScreenInStore,
  DeleteScreenInStore,

  ResetScreensAPIStatusInStore,
  ChangeProjectConfig,
]);

export type Action = typeof Action;

/* eslint-disable no-console */
const APIToScreen: (rawScreen: T.APIScreen) => T.Screen = (rawScreen): T.Screen => ({
  ...rawScreen,
  title: typeof rawScreen.title === 'string' ? rawScreen.title : '',
  appearAt: new Date(rawScreen.appearAt),
  contentIds: rawScreen.contentIds,
  createdAt: new Date(rawScreen.createdAt),
  updatedAt: new Date(rawScreen.updatedAt),
});

const getScreensEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetScreens),
  mergeMap(({ projectId }) => {
    const URL: string = makeV2APIURL('projects', projectId, 'screens');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    return ajax.get(URL, header).pipe(
      map(({ response }) => response.data.map(APIToScreen)),
      mergeMap((rawScreens) => {
        const screens: T.Screen[] = getSortedScreens(rawScreens);
        const lastSelectedScreenId: T.Screen['id'] | undefined = state$.value.ProjectConfigPerUser.config?.lastSelectedScreenId;
        const isLastSelectedScreenDeleted: boolean =
            (lastSelectedScreenId !== undefined && !screens.find((s) => s?.id === lastSelectedScreenId));
        const SetLastSelectedScreen: Array<Action> =
            lastSelectedScreenId === undefined || isLastSelectedScreenDeleted ? [
              ChangeProjectConfig({
                config: {
                  projectId,
                  lastSelectedScreenId: Boolean(screens[screens.length - 1]?.id) ? screens[screens.length - 1]?.id : undefined,
                },
              }),
              PatchProjectConfig({
                projectId, config: {
                  lastSelectedScreenId: Boolean(screens[screens.length - 1]?.id) ? screens[screens.length - 1]?.id : undefined,
                },
              }),
            ] : [];

        return [
          ...SetLastSelectedScreen,
          SetScreensInStore({ screens }),
          FinishGetScreens({}),
        ];
      }),
      catchError((ajaxError: AjaxError) => {
        // eslint-disable-next-line no-console
        console.error('Error in GetScreens', ajaxError);

        return [FinishGetScreens({ error: getRequestErrorType(ajaxError) })];
      }),
      takeUntil(
        action$.pipe(
          ofType(CancelGetScreens),
        ),
      ),
    );
  }),
);

const getScreenEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetScreen),
  mergeMap(({ screenId }) => {
    const URL: string = makeV2APIURL('screens', screenId);
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    return ajax.get(URL, header).pipe(
      map(({ response }) => response),
      map(({ data }) => APIToScreen(data)),
      mergeMap((screen) => [
        UpdateScreenInStore({ screen }),
        FinishGetScreen({}),
      ]),
      catchError((ajaxError: AjaxError) => [
        FinishGetScreen({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelGetScreen),
        ),
      ),
    );
  }),
);

/**
 * @desc Uniqueness of key (title, appearAt) in screens must be evaluated before calling this action
 */
const postScreenEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(PostScreen),
  mergeMap(({ title, appearAt, contentIds }) => {
    const projectId: number | undefined = state$.value.Pages.Contents.projectId;
    if (projectId === undefined) return [];

    const URL: string = makeV2APIURL('projects', projectId, 'screens');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    const body: PostScreenRequestBody = {
      title, contentIds,
      appearAt: appearAt ?
        formatWithOffset(state$.value.Pages.Common.timezoneOffset, appearAt, 'yyyy-MM-dd') :
        undefined,
    };

    return ajax.post(URL, body, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }) => response),
      map(({ data }) => data),
      map(APIToScreen),
      mergeMap((screen) => [
        AddScreenInStore({ screen }),
        /**
         * @todo Add Action(ChangeProjectConfig) that Changes 'lastSelectedScreenId' to posted one here
         */
        FinishPostScreen({}),
      ]),
      catchError((ajaxError: AjaxError) => {
        console.error('Error in PostScreen', ajaxError);

        return [FinishPostScreen({ error: getRequestErrorType(ajaxError) })];
      }),
      takeUntil(
        action$.pipe(
          ofType(CancelPostScreen),
        ),
      ),
    );
  }),
);

const patchScreenEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(PatchScreen),
  mergeMap(({ screenId, title, appearAt, updatedAt }) => {
    const URL: string = makeV2APIURL('screens', screenId);
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }
    const body: PatchScreenRequestBody = {
      title,
      appearAt: appearAt ?
        formatWithOffset(state$.value.Pages.Common.timezoneOffset, appearAt, 'yyyy-MM-dd') :
        undefined,
      updatedAt: updatedAt ?
        updatedAt.toISOString() :
        undefined,
    };

    return ajax.patch(URL, body, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      map(({ response: { data } }) => APIToScreen(data)),
      mergeMap((screen) => [
        UpdateScreenInStore({ screen }),
        FinishPatchScreen({}),
      ]),
      catchError((ajaxError: AjaxError) => {
        console.error('Error in PatchScreen', ajaxError);

        return [FinishPatchScreen({ error: getRequestErrorType(ajaxError) })];
      }),
      takeUntil(
        action$.pipe(
          ofType(CancelPatchScreen),
        ),
      ),
    );
  }),
);

const deleteScreenEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(DeleteScreen),
  mergeMap(({ screenId }) => {
    const URL: string = makeV2APIURL('screens', screenId);
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    return ajax.delete(URL, header).pipe(
      mergeMapTo([
        DeleteScreenInStore({ screenId }),
        FinishDeleteScreen({}),
      ]),
      catchError((ajaxError: AjaxError) => {
        console.error('Error in DeleteScreen', ajaxError);

        return [FinishDeleteScreen({ error: getRequestErrorType(ajaxError) })];
      }),
      takeUntil(
        action$.pipe(
          ofType(CancelDeleteScreen),
        ),
      ),
    );
  }),
);

/* eslint-enable no-console */

export const epic: Epic<Action, Action, T.State> = combineEpics(
  getScreenEpic,
  getScreensEpic,
  postScreenEpic,
  patchScreenEpic,
  deleteScreenEpic,
);

const initialState: T.ScreensState = {
  screens: [],
  getScreensStatus: T.APIStatus.IDLE,
  patchScreensStatus: T.APIStatus.IDLE,
  postScreensStatus: T.APIStatus.IDLE,
  deleteScreensStatus: T.APIStatus.IDLE,
};

const reducer: Reducer<T.ScreensState> = (state = initialState, action: Action) => {
  switch (action.type) {
    case GetScreens.type:
      return {
        ...state,
        getScreensStatus: T.APIStatus.PROGRESS,
      };
    case CancelGetScreens.type:
      return {
        ...state,
        getScreensStatus: T.APIStatus.IDLE,
      };
    case FinishGetScreens.type:
      return {
        ...state,
        getScreensStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        getScreensError: action.error,
      };

    case PostScreen.type:
      return {
        ...state,
        postScreensStatus: T.APIStatus.PROGRESS,
      };
    case CancelPostScreen.type:
      return {
        ...state,
        postScreensStatus: T.APIStatus.IDLE,
      };
    case FinishPostScreen.type:
      return {
        ...state,
        postScreensStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        postScreensError: action.error,
      };

    case PatchScreen.type:
      return {
        ...state,
        patchScreensStatus: T.APIStatus.PROGRESS,
      };
    case CancelPatchScreen.type:
      return {
        ...state,
        patchScreensStatus: T.APIStatus.IDLE,
      };
    case FinishPatchScreen.type:
      return {
        ...state,
        patchScreensStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        patchScreensError: action.error,
      };

    case DeleteScreen.type:
      return {
        ...state,
        deleteScreensStatus: T.APIStatus.PROGRESS,
      };
    case CancelDeleteScreen.type:
      return {
        ...state,
        deleteScreensStatus: T.APIStatus.IDLE,
      };
    case FinishDeleteScreen.type:
      return {
        ...state,
        deleteScreensStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        deleteScreensError: action.error,
      };

    case SetScreensInStore.type :
      return {
        ...state,
        screens: getSortedScreens(action.screens),
      };
    case AddScreenInStore.type:
      return {
        ...state,
        screens: getSortedScreens([...state.screens, action.screen]),
      };
    case UpdateScreenInStore.type:
      return produce(state, ({ screens }) => {
        const targetScreenIdx: number = screens.findIndex(((s) => s.id === action.screen.id));
        screens[targetScreenIdx] = action.screen;
      });
    case DeleteScreenInStore.type:
      return {
        ...state,
        screens: state.screens.filter((s) => s.id !== action.screenId),
      };

    case ResetScreensAPIStatusInStore.type:
      return {
        ...state,
        deleteScreensStatus: T.APIStatus.IDLE,
        postScreensStatus: T.APIStatus.IDLE,
        getScreensStatus: T.APIStatus.IDLE,
        patchScreensStatus: T.APIStatus.IDLE,
      };
    default:
      return state;
  }
};

export default reducer;
