/* eslint-disable max-lines */
import { LensGenerator, LensS } from '@typed-f/lens';
import { produce } from 'immer';
import _ from 'lodash-es';
import { Reducer } from 'redux';
import { Epic, combineEpics } from 'redux-observable';
import { concat } from 'rxjs';
import { AjaxError, ajax } from 'rxjs/ajax';
import {
  catchError,
  map,
  mergeMap, mergeMapTo,
  takeUntil,
} from 'rxjs/operators';
import {
  action as makeAction,
  props,
  union,
} from 'tsdux';
import { ofType } from 'tsdux-observable';

import * as T from '^/types';
import { determineUnitType } from '^/utilities/imperial-unit';
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
  makeVersionHeader,
  VersionHeader,
} from './API';
import { ChangeAuthedUser } from './Auth';
import {
  GetInitialContents,
} from './Contents';
import {
  ChangeProjectConfig,
} from './ProjectConfig';
import { GetScreens } from './Screens';
import {
  AddUserInfo,
} from './Users';

// API related types
interface PostProjectBody {
  readonly title: T.Project['title'];
  readonly coordinateSystem: T.Project['coordinateSystem'];
  readonly description: T.Project['description'];
  readonly planId: T.Project['planId'];
  readonly logo: File | undefined;
}
interface PatchProjectBody {
  readonly title?: T.Project['title'];
  readonly coordinateSystem?: T.Project['coordinateSystem'];
  readonly description?: T.Project['description'];
  readonly logo?: File | undefined;
  readonly updatedAt?: Date;
  readonly unit?: T.Project['unit'];
}

interface DeleteProjectBody {
  password: string;
}

const APIToProjectWithConfig: (responseProject: T.APIProject) => T.ProjectWithConfig = (
  responseProject,
): T.ProjectWithConfig => ({
  ...responseProject,
  owner: {
    ...responseProject.owner,
    avatar: (
      responseProject.owner.avatar !== null ?
        responseProject.owner.avatar :
        undefined
    ),
  },
  logo: (
    responseProject.logo !== null ?
      responseProject.logo :
      undefined
  ),
  thumbnail: (
    responseProject.thumbnail !== null ?
      responseProject.thumbnail :
      undefined
  ),
  coordinateSystem: (
    responseProject.coordinateSystem !== null ?
    responseProject.coordinateSystem as T.ProjectionEnum :
      undefined
  ),
  config: {
    ...responseProject.config,
    lastGcp: responseProject.config.lastGcp ? {
      ...responseProject.config.lastGcp,
      uploadedAt: new Date(responseProject.config.lastGcp.uploadedAt),
    } : undefined,
    lastSelectedScreenId: responseProject.config.lastSelectedScreenId,
    isMapShown: responseProject.config?.isMapShown === undefined ? true : responseProject.config.isMapShown,
  },
  createdAt: new Date(responseProject.createdAt),
  updatedAt: new Date(responseProject.updatedAt),
  availableDates: responseProject.availableDates
    .map((stringDate) => new Date(stringDate)),
  type: responseProject.type,
  unit: determineUnitType(responseProject.unit),
});

interface GetProjectResponse {
  readonly data: T.APIProject;
  readonly status: {
    readonly code: number;
  };
}
interface GetProjectsResponse {
  readonly data: Array<T.APIProject>;
  readonly status: {
    readonly code: number;
  };
}

// Redux actions

export const GetProject = makeAction(
  'ddm/projects/GET_PROJECT',
  props<{
    readonly projectId: T.Project['id'];
  }>(),
);
export const CancelGetProject = makeAction(
  'ddm/projects/CANCEL_GET_PROJECT',
);
export const FinishGetProject = makeAction(
  'ddm/projects/FINISH_GET_PROJECT',
  props<FinishProps>(),
);

export const GetProjects = makeAction(
  'ddm/projects/GET_PROJECTS',
);
export const CancelGetProjects = makeAction(
  'ddm/projects/CANCEL_GET_PROJECTS',
);
export const FinishGetProjects = makeAction(
  'ddm/projects/FINISH_GET_PROJECTS',
  props<FinishProps>(),
);

export const PostProject = makeAction(
  'ddm/projects/POST_PROJECT',
  props<{
    readonly project: PostProjectBody;
  }>(),
);
export const CancelPostProject = makeAction(
  'ddm/projects/CANCEL_POST_PROJECT',
);
export const FinishPostProject = makeAction(
  'ddm/projects/FINISH_POST_PROJECT',
  props<FinishProps>(),
);

export const PatchProject = makeAction(
  'ddm/projects/PATCH_PROJECT',
  props<{
    readonly project: Pick<T.Project, 'id'> & PatchProjectBody;
  }>(),
);
export const CancelPatchProject = makeAction(
  'ddm/projects/CANCEL_PATCH_PROJECT',
);
export const FinishPatchProject = makeAction(
  'ddm/projects/FINISH_PATCH_PROJECT',
  props<FinishProps>(),
);

export const DeleteProject = makeAction(
  'ddm/projects/DELETE_PROJECT',
  props<{
    readonly projectId: T.Project['id'];
    readonly password: string;
  }>(),
);
export const CancelDeleteProject = makeAction(
  'ddm/projects/CANCEL_DELETE_PROJECT',
);
export const FinishDeleteProject = makeAction(
  'ddm/projects/FINISH_DELETE_PROJECT',
  props<FinishProps>(),
);

export const ChangeProjects = makeAction(
  'ddm/projects/CHANGE_PROJECTS',
  props<{
    readonly projects?: Array<T.Project>;
  }>(),
);

export const UpdateProjectInStore = makeAction(
  'ddm/projects/UPDATE_PROJECT_IN_STORE',
  props<{
    readonly project: T.Project;
  }>(),
);

export const AddProject = makeAction(
  'ddm/projects/ADD_PROJECT',
  props<{
    readonly project: T.Project;
  }>(),
);

export const RemoveProject = makeAction(
  'ddm/projects/REMOVE_PROJECT',
  props<{
    readonly projectId: T.Project['id'];
  }>(),
);

export const GetCalendar = makeAction(
  'ddm/projects/GET_CALENDAR',
  props<{
    readonly projectId: T.Project['id'];
  }>(),
);
export const CancelGetCalendar = makeAction(
  'ddm/projects/CANCEL_GET_CALENDAR',
);
export const FinishGetCalendar = makeAction(
  'ddm/projects/FINISH_GET_CALENDAR',
  props<FinishProps>(),
);

export const AddCalendarToProject = makeAction(
  'ddm/projects/ADD_CALENDAR_TO_PROJECT',
  props<{
    readonly projectId: T.Project['id'];
    readonly availableDates: Array<Date>;
  }>(),
);

const Action = union([
  GetProject,
  CancelGetProject,
  FinishGetProject,

  GetProjects,
  CancelGetProjects,
  FinishGetProjects,

  PostProject,
  CancelPostProject,
  FinishPostProject,

  PatchProject,
  CancelPatchProject,
  FinishPatchProject,

  DeleteProject,
  CancelDeleteProject,
  FinishDeleteProject,

  ChangeProjects,
  UpdateProjectInStore,

  AddProject,

  RemoveProject,

  GetCalendar,
  CancelGetCalendar,
  FinishGetCalendar,

  AddCalendarToProject,

  // Out-duck actions
  GetInitialContents,
  GetScreens,
  AddUserInfo,
  ChangeAuthedUser,
  ChangeProjectConfig,
]);
export type Action = typeof Action;


// Redux-Observable Epics
const getProjectsEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetProjects),
  mergeMap(() => {
    const URL: string = makeV2APIURL('projects');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    return ajax.get(URL, header).pipe(
      map(({ response }): GetProjectsResponse => response),
      map(({ data }) => ({
        projects: data.map(APIToProjectWithConfig),
      })),
      mergeMap(({ projects }) => [
        ChangeProjects({ projects: projects.map((project) => _.omit(project, ['config'])) }),
        FinishGetProjects({}),
      ]),
      catchError((ajaxError: AjaxError) => [
        FinishGetProjects({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelGetProjects),
        ),
      ),
    );
  }),
);

const getProjectEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetProject),
  mergeMap(({ projectId }) => {
    const URL: string = makeV2APIURL('projects', projectId);
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);
    const versionHeader: VersionHeader = makeVersionHeader();
    if (header === undefined) return [ChangeAuthedUser({})];

    return ajax.get(URL, {
      ...header,
      ...versionHeader,
    }).pipe(
      map(({ response }): GetProjectResponse => response),
      map(({ data }) => data),
      map(APIToProjectWithConfig),
      mergeMap((projectWithConfig) => [
        ChangeProjects({ projects: [_.omit(projectWithConfig, ['config'])] }),
        ChangeProjectConfig({ config: projectWithConfig.config }),
        GetScreens({ projectId }),
        GetInitialContents({ projectId }),
      ]),
      (res$) => concat(res$, [FinishGetProject({})]),
      catchError((ajaxError: AjaxError) => [
        FinishGetProject({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelGetProject),
        ),
      ),
    );
  }),
);

const postProjectEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(PostProject),
  mergeMap(({ project: actionProject }) => {
    const URL: string = makeV2APIURL('projects');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    const formdata: FormData = new FormData();
    Object.keys(actionProject).forEach((key: keyof PostProjectBody) => {
      const val: PostProjectBody[keyof PostProjectBody] = actionProject[key];
      if (val !== undefined) {
        formdata.append(key, val);
      }
    });

    return ajax.post(URL, formdata, header).pipe(
      map(({ response }): GetProjectResponse => response),
      map(({ data }) => data),
      map(APIToProjectWithConfig),
      mergeMap((projectWithConfig) => [
        AddProject({
          project: _.omit(projectWithConfig, ['config']),
        }),
        ChangeProjectConfig({ config: projectWithConfig.config }),
      ]),
      (res$) => concat(res$, [FinishPostProject({})]),
      catchError<Action, any>((ajaxError: AjaxError) => [
        FinishPostProject({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelPostProject),
        ),
      ),
    );
  }),
);

const patchProjectEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(PatchProject),
  mergeMap(({ project: { id, ...body } }) => {
    const URL: string = makeV2APIURL('projects', id);
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (header === undefined) {
      return [ChangeAuthedUser({})];
    }

    const formdata: FormData = new FormData();
    Object.keys(body).forEach((key: keyof PatchProjectBody) => {
      const val: PatchProjectBody[keyof PatchProjectBody] = body[key];
      /**
       * @description Don't need to validate timestamp, so timestamp-related value is not necessary.
       */
      if (val !== undefined && !(val instanceof Date)) {
        formdata.append(key, val);
      }
    });

    const patchProjectFormData = ajax.patch(URL, formdata, header);

    return patchProjectFormData.pipe(
      map(({ response }): GetProjectResponse => response),
      map(({ data }) => data),
      map(APIToProjectWithConfig),
      mergeMap((projectWithConfig) => [
        AddProject({ project: _.omit(projectWithConfig, ['config']) }),
        ChangeProjectConfig({ config: projectWithConfig.config }),
      ]),
      (res$) => concat(res$, [FinishPatchProject({})]),
      catchError<Action, any>((ajaxError: AjaxError) => [
        FinishPatchProject({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelPatchProject),
        ),
      ),
    );
  }),
);

const deleteProjectEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(DeleteProject),
  mergeMap(({ projectId, password }) => {
    const url: string = makeV2APIURL('projects', projectId);
    const headers: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (headers === undefined) {
      return [ChangeAuthedUser({})];
    }

    const body: DeleteProjectBody = { password };

    return ajax({ method: 'DELETE', url, body, headers }).pipe(
      mergeMapTo([
        RemoveProject({ projectId }),
        FinishDeleteProject({}),
      ]),
      catchError((ajaxError: AjaxError) => [
        FinishDeleteProject({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelDeleteProject),
        ),
      ),
    );
  }),
);

const getCalendarEpic: Epic<Action, any, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(GetCalendar),
  mergeMap(({ projectId }) => {
    const URL: string = makeV2APIURL('projects', projectId, 'calendar');
    const header: AuthHeader | undefined = makeAuthHeader(state$.value.Auth, state$.value.PlanConfig.config?.slug);

    if (!header) {
      return [];
    }

    return ajax.get(URL, {
      ...header,
      ...jsonContentHeader,
    }).pipe(
      map(({ response: { data } }) => data as Array<string>),
      map((availabeDates) => availabeDates.map((date) => new Date(date))),
      map((data) => data.sort((a, b) => a.getTime() - b.getTime())),
      mergeMap((availableDates) => [
        AddCalendarToProject({ projectId, availableDates }),
        FinishGetCalendar({}),
      ]),
      catchError((ajaxError: AjaxError) => [
        FinishGetCalendar({ error: getRequestErrorType(ajaxError) }),
      ]),
      takeUntil(
        action$.pipe(
          ofType(CancelGetCalendar),
        ),
      ),
    );
  }),
);

export const epic: Epic<Action, Action, T.State> = combineEpics(
  getProjectEpic,
  getProjectsEpic,
  postProjectEpic,
  patchProjectEpic,
  deleteProjectEpic,
  getCalendarEpic,
  /**
   * @todo
   * Add CancelAcceptProject
   */
  actionsForEpicReload<Action>(
    CancelGetProjects(), CancelPostProject(), CancelPatchProject(), CancelDeleteProject(),
  ),
);

export const projectsStateLens: LensS<T.ProjectsState, T.ProjectsState> =
  new LensGenerator<T.ProjectsState>().fromKeys();

type ProjectsFocusLens<K extends keyof T.ProjectsState> =
  LensS<T.ProjectsState[K], T.ProjectsState>;
const projectsLens: ProjectsFocusLens<'projects'> =
  projectsStateLens.focusTo('projects');

// Redux reducer
const initialState: T.ProjectsState = {
  projects: {
    byId: {},
    allIds: [],
  },
  getProjectsStatus: T.APIStatus.IDLE,
  postProjectStatus: T.APIStatus.IDLE,
  patchProjectStatus: T.APIStatus.IDLE,
  deleteProjectStatus: T.APIStatus.IDLE,
  getCalendarStatus: T.APIStatus.IDLE,
  getProjectStatus: T.APIStatus.IDLE,
};
const reducer: Reducer<T.ProjectsState> = (
  state = initialState, action: Action,
) => {
  switch (action.type) {
    case GetProject.type:
      return {
        ...state,
        getProjectStatus: T.APIStatus.PROGRESS,
      };
    case CancelGetProject.type:
      return {
        ...state,
        getProjectStatus: T.APIStatus.IDLE,
      };
    case FinishGetProject.type:
      return {
        ...state,
        getProjectStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        getProjectError: action.error,
      };

    case GetProjects.type:
      return {
        ...state,
        getProjectsStatus: T.APIStatus.PROGRESS,
      };
    case CancelGetProjects.type:
      return {
        ...state,
        getProjectsStatus: T.APIStatus.IDLE,
      };
    case FinishGetProjects.type:
      return {
        ...state,
        getProjectsStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        getProjectsError: action.error,
      };

    case PostProject.type:
      return {
        ...state,
        postProjectStatus: T.APIStatus.PROGRESS,
      };
    case CancelPostProject.type:
      return {
        ...state,
        postProjectStatus: T.APIStatus.IDLE,
        postProjectError: undefined,
      };
    case FinishPostProject.type:
      return {
        ...state,
        postProjectStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        postProjectError: action.error,
      };

    case PatchProject.type:
      return {
        ...state,
        patchProjectStatus: T.APIStatus.PROGRESS,
      };
    case CancelPatchProject.type:
      return {
        ...state,
        patchProjectStatus: T.APIStatus.IDLE,
        patchProjectError: undefined,
      };
    case FinishPatchProject.type:
      return {
        ...state,
        patchProjectStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        patchProjectError: action.error,
      };

    case DeleteProject.type:
      return {
        ...state,
        deleteProjectStatus: T.APIStatus.PROGRESS,
      };
    case CancelDeleteProject.type:
      return {
        ...state,
        deleteProjectStatus: T.APIStatus.IDLE,
      };
    case FinishDeleteProject.type:
      return {
        ...state,
        deleteProjectStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        deleteProjectError: action.error,
      };

    case ChangeProjects.type:
      return projectsLens
        .map()(state)(() => {
          const allIds: Array<number> = _.map(action.projects, _.property('id'));

          /**
           * @fixme
           * Is there any reason for allowing `undefined` project?
           */
          return {
            byId: action.projects !== undefined ?
              _.zipObject(allIds, action.projects) :
              {},
            allIds,
          };
        });
    case UpdateProjectInStore.type:
      return projectsLens
        .map()(state)(({ byId, allIds }) => ({
          byId: {
            ...byId,
            [action.project.id]: action.project,
          },
          allIds: _.orderBy(_.union([action.project.id], allIds)),
        }));
    case AddProject.type:
      return projectsLens
        .map()(state)(({ byId, allIds }) => ({
          byId: {
            ...byId,
            [action.project.id]: action.project,
          },
          allIds: _.orderBy(_.union([action.project.id], allIds)),
        }));
    case RemoveProject.type:
      return projectsLens
        .map()(state)(({ byId, allIds }) => ({
          byId: _.omit(byId, action.projectId),
          allIds: _.without(allIds, action.projectId),
        }));
    case GetCalendar.type:
      return {
        ...state,
        getCalendarStatus: T.APIStatus.PROGRESS,
      };
    case CancelGetCalendar.type:
      return {
        ...state,
        getCalendarStatus: T.APIStatus.IDLE,
      };
    case FinishGetCalendar.type:
      return {
        ...state,
        getCalendarStatus: action.error === undefined ? T.APIStatus.SUCCESS : T.APIStatus.ERROR,
        getCalendarError: action.error,
      };
    case AddCalendarToProject.type:
      return produce(state, ({ projects: { byId } }) => {
        byId[action.projectId] = { ...byId[action.projectId], availableDates: action.availableDates };
      });

    default:
      return state;
  }
};
export default reducer;
