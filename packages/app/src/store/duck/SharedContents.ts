import { Coordinate } from 'ol/coordinate';
import { Reducer } from 'redux';
import { Epic, combineEpics } from 'redux-observable';
import { concat } from 'rxjs';
import { AjaxError, ajax } from 'rxjs/ajax';
import { catchError, map, mergeMap, takeUntil } from 'rxjs/operators';
import {
  action as makeAction,
  props,
  union,
} from 'tsdux';
import { ofType } from 'tsdux-observable';

import * as T from '^/types';
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
import {
  ChangeAuthedUser,
} from './Auth';
import {
  APIToContent,
  ChangeContents,
} from './Contents';
import { ChangeTwoDDisplayCenter, ChangeTwoDDisplayZoom } from './Pages';

import { getCoordinateSystem } from '^/hooks';
import { setCloudFrontCookie } from '^/utilities/cookie';


interface CameraInformation {
  readonly cameraPosition: Coordinate;
  readonly zoomLevel: number;
}

export interface SharedProjectDetail {
  readonly showAt: string;
  readonly projectName: string;
  readonly screenTitle: T.SharedContentsState['screenTitle'];
  readonly navbarLogoUrl: T.SharedContentsState['navbarLogoUrl'];
  readonly projection: T.ProjectionEnum;
  readonly projectId: T.Project['id'];
  readonly projectUnit?: T.UnitType;
}

interface PostShareRequestBody extends CameraInformation, SharedProjectDetail {
  readonly contentsIds: Array<T.Content['id']>;
  readonly expiredAt: string;
}

interface GetSharedContentsResponse {
  readonly data: Array<T.APIContent>;
  readonly meta: CameraInformation & SharedProjectDetail & T.APICloudFront;
}

interface PostShareRequestResponse {
  readonly data: {
    readonly attributes: {
      readonly token: string;
      readonly contentsIds: Array<T.Content['id']>;
      readonly expiredAt: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly information: CameraInformation;
    };
  };
}

//Redux actions

export const GetSharedContents = makeAction(
  'ddm/share/GET_SHARED_CONTENTS',
);
export const CancelGetSharedContents = makeAction(
  'ddm/share/CANCEL_GET_SHARED_CONTENTS',
);
export const FinishGetSharedContents = makeAction(
  'ddm/share/FINISH_GET_SHARED_CONTENTS',
  props<FinishProps>(),
);

export const PostShareRequest = makeAction(
  'ddm/share/POST_SHARE_REQUEST',
  props<{
    readonly contentIds: Array<T.Content['id']>;
    readonly expiredAt: Date;
    readonly navbarLogoUrl: T.SharedContentsState['navbarLogoUrl'];
    readonly cameraPosition: Coordinate;
    readonly zoomLevel: number;
  }>(),
);
export const CancelPostShareRequest = makeAction(
  'ddm/share/CANCEL_POST_SHARE_REQUEST',
);
export const FinishPostShareRequest = makeAction(
  'ddm/share/FINISH_POST_SHARE_REQUEST',
  props<FinishProps>(),
);

export const ChangeShareToken = makeAction(
  'ddm/share/CHANGE_SHARE_TOKEN',
  props<{
    readonly shareToken?: T.SharedContentsState['shareToken'];
  }>(),
);

export interface ChangeSharedProjectDetail {
  showAt: T.SharedContentsState['showAt'];
  screenTitle: SharedProjectDetail['screenTitle'];
  navbarLogoUrl: SharedProjectDetail['navbarLogoUrl'];
  projectName: SharedProjectDetail['projectName'];
  projection: SharedProjectDetail['projection'];
  projectUnit?: T.UnitType;
}

export const ChangeSharedProjectDetail = makeAction(
  'ddm/share/CHANGE_SHARED_PROJECT_DETAIL',
  props<ChangeSharedProjectDetail & { readonly initialCameraPosition: Coordinate }>(),
);

const Action = union([
  GetSharedContents,
  CancelGetSharedContents,
  FinishGetSharedContents,

  PostShareRequest,
  CancelPostShareRequest,
  FinishPostShareRequest,

  ChangeShareToken,

  // Out-duck actions
  ChangeAuthedUser,

  ChangeContents,

  ChangeTwoDDisplayCenter,
  ChangeTwoDDisplayZoom,

  ChangeSharedProjectDetail,
]);
export type Action = typeof Action;


// Redux-Observable Epics
const getSharedContentsEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetSharedContents),
  mergeMap(() => {
    const shareToken: T.SharedContentsState['shareToken'] =
      state$.value.SharedContents.shareToken;

    if (shareToken === undefined) {
      return [];
    }

    const URL: string = makeV2APIURL('shares', shareToken);

    return ajax.get(URL).pipe(
      map(({ response }): GetSharedContentsResponse => response),
      mergeMap(({ data, meta }) => {
        const contents: Array<T.Content> = data.map(APIToContent);
        const {
          cloudFrontSignature: signature, cloudFrontKeyPairId: keyPairId, cloudFrontPolicy: policy,
        }: T.APICloudFront = meta;

        setCloudFrontCookie({ signature, keyPairId, policy });
        return [
          ChangeContents({ contents }),
          ChangeSharedProjectDetail({
            showAt: new Date(meta.showAt),
            projectName: meta.projectName,
            navbarLogoUrl: meta.navbarLogoUrl,
            initialCameraPosition: meta.cameraPosition,
            screenTitle: meta.screenTitle,
            projection: meta.projection,
            projectUnit: meta.projectUnit,
          }),
          ChangeTwoDDisplayCenter({ twoDDisplayCenter: meta.cameraPosition }),
          ChangeTwoDDisplayZoom({ twoDDisplayZoom: meta.zoomLevel }),
        ];
      }),
      (res$) => concat(res$, [
        FinishGetSharedContents({}),
      ]),
      catchError<Action, any>((ajaxError: AjaxError) => [
        FinishGetSharedContents({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelGetSharedContents),
        ),
      ),
    );
  }),
);

const postShareRequestEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(PostShareRequest),
  mergeMap(({ contentIds, expiredAt, cameraPosition, zoomLevel, navbarLogoUrl }) => {
    const currentProjectId: number | undefined = state$.value.ProjectConfigPerUser.config?.projectId;

    // User should always share when they're currently editing a project,
    // since it can only happen on the project content's page, so the id has to exist.
    if (currentProjectId === undefined) return [];

    const URL: string = makeV2APIURL('shares');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    const screens: Array<T.Screen> = state$.value.Screens.screens;
    const lastSelectedScreenId: T.Screen['id'] | undefined = state$.value.ProjectConfigPerUser.config?.lastSelectedScreenId;
    const lastSelectedScreenDate: Date | undefined = state$.value.Screens.screens.find(({ id }) => id === lastSelectedScreenId)?.appearAt;
    const screenTitle: string | undefined = screens.find((s) => s.id === lastSelectedScreenId)?.title;
    const currentProject: T.Project = state$.value.Projects.projects.byId[currentProjectId];

    if (header === undefined) return [ChangeAuthedUser({})];

    const body: PostShareRequestBody = {
      contentsIds: contentIds,
      expiredAt: expiredAt.toISOString(),
      showAt: (lastSelectedScreenDate ? lastSelectedScreenDate : new Date()).toISOString(),
      projectName: currentProject.title,
      navbarLogoUrl,
      projection: getCoordinateSystem({ Projects: state$.value.Projects, Pages: state$.value.Pages }),
      screenTitle: String(screenTitle ? screenTitle : ''),
      cameraPosition,
      zoomLevel,
      projectId: currentProjectId,
    };

    return ajax.post(URL, body, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      map(({ response }): PostShareRequestResponse => response),
      map(({ data }) => data.attributes.token),
      map((shareToken) => ({ shareToken })),
      map(ChangeShareToken),
      (res$) => concat(res$, [FinishPostShareRequest({})]),
      catchError<Action, any>((ajaxError: AjaxError) => [
        FinishPostShareRequest({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelPostShareRequest),
        ),
      ),
    );
  }),
);

export const epic: Epic<Action, Action, T.State> = combineEpics(
  getSharedContentsEpic,
  postShareRequestEpic,
  actionsForEpicReload<Action>(
    CancelGetSharedContents(), CancelPostShareRequest(),
  ),
);

// Redux reducer
/**
 * @desc
 * There is no deep-level modification for this reducer,
 * so introducing lens does not help restructuring this.
 */
const initialState: T.SharedContentsState = {
  getSharedContentsStatus: T.APIStatus.IDLE,
  postShareRequestStatus: T.APIStatus.IDLE,
  navbarLogoUrl: '',
  projectName: '',
  screenTitle: '',
  projection: T.ProjectionEnum.Bessel_EPSG_5174_EN,
  // eslint-disable-next-line no-magic-numbers
  initialCameraPosition: [127, 39],
};
const reducer: Reducer<T.SharedContentsState> = (
  state = initialState, action: Action,
) => {
  switch (action.type) {
    case GetSharedContents.type:
      return {
        ...state,
        getSharedContentsStatus: T.APIStatus.PROGRESS,
        getSharedContentsError: undefined,
      };
    case CancelGetSharedContents.type:
      return {
        ...state,
        getSharedContentsStatus: T.APIStatus.IDLE,
        getSharedContentsError: undefined,
      };
    case FinishGetSharedContents.type:
      return {
        ...state,
        getSharedContentsStatus: action.error === undefined ?
          T.APIStatus.SUCCESS :
          T.APIStatus.ERROR,
        getSharedContentsError: action.error,
      };

    case PostShareRequest.type:
      return {
        ...state,
        postShareRequestStatus: T.APIStatus.PROGRESS,
        postShareRequestError: undefined,
      };
    case CancelPostShareRequest.type:
      return {
        ...state,
        postShareRequestStatus: T.APIStatus.IDLE,
        postShareRequestError: undefined,
      };
    case FinishPostShareRequest.type:
      return {
        ...state,
        postShareRequestStatus: action.error === undefined ?
          T.APIStatus.SUCCESS :
          T.APIStatus.ERROR,
        postShareRequestError: action.error,
      };

    case ChangeShareToken.type:
      return {
        ...state,
        shareToken: action.shareToken,
      };

    case ChangeSharedProjectDetail.type:
      return {
        ...state,
        showAt: action.showAt,
        projectName: action.projectName,
        navbarLogoUrl: action.navbarLogoUrl,
        initialCameraPosition: action.initialCameraPosition,
        screenTitle: action.screenTitle,
        projection: action.projection,
        projectUnit: action.projectUnit,
      };

    default:
      return state;
  }
};
export default reducer;
