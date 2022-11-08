import { LOCATION_CHANGE, LocationChangeAction } from 'connected-react-router';
import { pathToRegexp } from 'path-to-regexp';
import { Epic, combineEpics } from 'redux-observable';
import { mergeMap } from 'rxjs/operators';
import { union } from 'tsdux';

import config, { BuildLevel } from '^/config';
import routes from '^/constants/routes';

import {
  InitializeAttatchment,
} from './Attachments';
import {
  ChangePathBeforeAuth,
} from './Auth';
import {
  ChangeContents, ResetContentsAPIStatusInStore,
} from './Contents';
import {
  InitializeESSAttatchment,
} from './ESSAttachments';
import {
  ChangeContentsSidebarTab,
  ChangeCreatingVolume,
  ChangeCurrentContentTypeFromAnnotationPicker,
  ChangeEditingContent,
  ChangeIn3D,
  ChangeIsInContentsHistoryLogTable,
  ChangeIsInSourcePhotoUpload,
  ChangeIsTopBarShown,
  ChangeProjectId,
  ChangeSidebarStatus,
  ChangeTwoDDisplayMode,
  CloseContentPageMapPopup,
  CloseContentPagePopup,
} from './Pages/Content';
import { ChangeNewPasswordToken } from './Pages/Front';
import {
  ChangeEditingProject,
  ChangeProjectPageTab,
  CloseProjectPagePopup,
} from './Pages/Project';
import {
  GetPlanConfig,
} from './PlanConfig';
import {
  ChangeProjectConfig,
} from './ProjectConfig';
import {
  GetProject,
} from './Projects';
import { ResetScreensAPIStatusInStore } from './Screens';
import {
  ChangeShareToken,
  GetSharedContents,
} from './SharedContents';

import * as T from '^/types';
import { GetUserConfig } from './UserConfig';
import { updatePrimaryColor } from '^/constants/ds-palette';

// Redux actions
const TsduxAction = union([
  ChangeNewPasswordToken,

  ChangeContents,

  GetProject,

  ChangeShareToken,
  GetSharedContents,

  ChangeEditingContent,
  ChangeIn3D,
  ChangeProjectId,
  ChangeSidebarStatus,
  ChangeIsTopBarShown,
  ChangeTwoDDisplayMode,
  CloseContentPagePopup,

  ChangeCurrentContentTypeFromAnnotationPicker,
  ChangeCreatingVolume,

  ChangeIsInSourcePhotoUpload,
  ChangeIsInContentsHistoryLogTable,

  ChangeEditingProject,
  ChangeProjectPageTab,
  CloseProjectPagePopup,
  CloseContentPageMapPopup,

  InitializeAttatchment,
  InitializeESSAttatchment,

  ChangeProjectConfig,
  GetUserConfig,
  GetPlanConfig,

  ChangeContentsSidebarTab,

  ResetContentsAPIStatusInStore,
  ResetScreensAPIStatusInStore,

  ChangePathBeforeAuth,
]);
export type Action
  = LocationChangeAction
  | typeof TsduxAction
;

const signInPageEnterActions: (slug: string | undefined) => Array<Action> = (slug) => [
  GetPlanConfig({ slug }),
];
const signUpPageEnterActions: (slug: string | undefined) => Array<Action> = (slug) => [
  GetPlanConfig({ slug }),
];
const signUpRequestPageEnterActions: (slug: string | undefined) => Array<Action> = (slug) => [
  GetPlanConfig({ slug }),
];
const signUpProcessingPageEnterActions: (slug: string | undefined) => Array<Action> = (slug) => [
  GetPlanConfig({ slug }),
];
const passwordPageEnterActions: (slug: string | undefined) => Array<Action> = (slug) => [
  GetPlanConfig({ slug }),
];
const passwordPageResetEnterActions: (token: string, slug?: string) => Array<Action> = (
  token, slug,
) => [
  GetPlanConfig({ slug }),
  ChangeNewPasswordToken({ newPasswordToken: token }),
];
const projectPageEnterActions: () => Array<Action> = () => [
  ChangeContents({ contents: [] }),
  ChangeProjectConfig({}),
  ChangeProjectId({}),
  ChangeProjectPageTab({ tab: T.ProjectPageTabType.LIST }),
];
const projectPageManageEnterActions: (projectId: number) => Array<Action> = (projectId) => [
  GetProject({ projectId }),
  ChangeEditingProject({ projectId }),
  ChangeProjectPageTab({ tab: T.ProjectPageTabType.MANAGE }),
];
const projectPageMypageEnterActions: () => Array<Action> = () => [
  ChangeProjectPageTab({ tab: T.ProjectPageTabType.MYPAGE }),
];
const contentPageEnterActions: (projectId: number) => Array<Action> = (projectId) => [
  GetUserConfig(),
  ChangeProjectConfig({}),
  ChangeProjectId({ projectId }),
  ChangeSidebarStatus({ open: true }),
  ChangeIsTopBarShown({ isOpened: true }),
  ChangeCurrentContentTypeFromAnnotationPicker({}),
  ChangeCreatingVolume({}),
  ChangeIsInSourcePhotoUpload({ isInSourcePhotoUpload: false }),
  ChangeIsInContentsHistoryLogTable({ isInContentsEventLogTable: false }),
  ChangeContentsSidebarTab({ sidebarTab: T.ContentPageTabType.MAP }),
  CloseContentPageMapPopup(),
  GetProject({ projectId }),
];
const sharePageEnterActions: (shareToken: string) => Array<Action> = (shareToken) => [
  ChangeShareToken({ shareToken }),
  GetSharedContents(),
];
const projectPageExitActions: () => Array<Action> = () => [
  CloseProjectPagePopup(),
];
const projectPageManageExitActions: () => Array<Action> = () => [
  ChangeEditingProject({ projectId: undefined }),
];
const projectPageMypageExitActions: () => Array<Action> = () => [
];
const contentPageExitActions: () => Array<Action> = () => [
  ChangeIn3D({ in3D: false }),
  ChangeTwoDDisplayMode({ twoDDisplayMode: T.TwoDDisplayMode.NORMAL }),
  ChangeEditingContent({}),
  ResetContentsAPIStatusInStore({}),
  ResetScreensAPIStatusInStore({}),
  CloseContentPagePopup(),
  InitializeAttatchment(),
  InitializeESSAttatchment(),
];
const sharePageExitActions: () => Array<Action> = () => [
  ChangeShareToken({}),
  ChangeContents({ contents: [] }),
];


// Since the es are not completely separated, add the variable to compare with the old ESS.
// This variable must be deleted when the ESS is completely isolated.
const DDM_SUBDOMAIN_SUFFIX_DEV = '-legacy';
export const getDDMSubdomain: () => string | undefined = () => {
  // IE does not support location.hostname,
  // so use the regex as the fallback.
  const hostname: string = window.location.hostname || (/:\/\/([^\/]+)/.exec(window.location.href)?.[1] ?? '');

  if (hostname.length === 0) {
    throw new Error(`Could not find hostname: ${hostname}`);
  }

  const hostnameSplits: string[] = hostname.split('.');

  // The URL pattern is [subdomain].angelswing.io,
  // which is why it has to be in three parts.
  /* eslint-disable no-magic-numbers */
  if (hostnameSplits.length !== 3) {
    throw new Error(`Missing subdomain for ${hostname}`);
  }

  // In BE, the automatically-generated subdomain is appended with `-dev` for the dev environment.
  // It makes sense since technically it's sharing the same subdomain angelswing.io.
  // In order to make the code work, the subdomain had to be cleaned up here.

  if (config.buildLevel === BuildLevel.PRODUCTION) {
    return hostnameSplits[0];
  }

  const devSuffixIndex: number = hostnameSplits[0].lastIndexOf(DDM_SUBDOMAIN_SUFFIX_DEV);

  return devSuffixIndex === hostnameSplits[0].length - DDM_SUBDOMAIN_SUFFIX_DEV.length
    ? hostnameSplits[0].slice(0, devSuffixIndex)
    : hostnameSplits[0];
};

let lastPath: string = '';
let isUnauthRedirected: boolean = false;

// Redux-Observable Epics
const routeEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.ofType(LOCATION_CHANGE).pipe(
  mergeMap((action: LocationChangeAction) => {
    /*
     * @fixme
     * There is a bug with router's LOCATION_CHANGE action.
     * whenever location is changed, LOCATION_CHANGE fires at least twice.
     * This code is to block one of the two calls as a temporary fix.
     */
    if (lastPath === action.payload.location.pathname) {
      return [];
    }

    let exitAction: Array<Action> = [];
    // Create actions for exiting route
    if (pathToRegexp(routes.project.main).test(lastPath)) {
      exitAction = projectPageExitActions();
    } else if (pathToRegexp(routes.project.manage).test(lastPath)) {
      exitAction = projectPageManageExitActions();
    } else if (pathToRegexp(routes.project.mypage).test(lastPath)) {
      exitAction = projectPageMypageExitActions();
    } else if (pathToRegexp(routes.content.main).test(lastPath)) {
      exitAction = contentPageExitActions();
    } else if (pathToRegexp(routes.share.main).test(lastPath)) {
      exitAction = sharePageExitActions();
    }

    // Create actions for entering route
    let enterAction: Array<Action> = [];
    const pathname: string = action.payload.location.pathname;
    const subdomain = getDDMSubdomain();

    // No path present, user simply comes from the main page
    // therefore, signup setup should be run.
    const isMainPage: boolean = lastPath === '' && pathname === '/';

    if (isMainPage || pathToRegexp(routes.login.main).test(pathname)) {
      enterAction = signInPageEnterActions(subdomain);
    } else if (pathToRegexp(routes.signup.main).test(pathname)) {
      enterAction = signUpPageEnterActions(subdomain);
    } else if (pathToRegexp(routes.signup.request).test(pathname)) {
      enterAction = signUpRequestPageEnterActions(subdomain);
    } else if (pathToRegexp(routes.signup.processing).test(pathname)) {
      enterAction = signUpProcessingPageEnterActions(subdomain);
    } else if (pathToRegexp(routes.password.main).test(pathname)) {
      enterAction = passwordPageEnterActions(subdomain);
    } else if (pathToRegexp(routes.password.reset).test(pathname)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const result: RegExpExecArray = pathToRegexp(routes.password.reset).exec(pathname)!;

      enterAction = passwordPageResetEnterActions(result[1], subdomain);
    } else if (pathToRegexp(routes.project.main).test(pathname)) {
      enterAction = projectPageEnterActions();
    } else if (pathToRegexp(routes.project.mypage).test(pathname)) {
      enterAction = projectPageMypageEnterActions();
    } else if (pathToRegexp(routes.project.manage).test(pathname)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const params: RegExpExecArray = pathToRegexp(routes.project.manage).exec(pathname)!;
      enterAction = projectPageManageEnterActions(Number(params[1]));
    } else if (pathToRegexp(routes.content.main).test(pathname)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const params: RegExpExecArray = pathToRegexp(routes.content.main).exec(pathname)!;
      enterAction = contentPageEnterActions(Number(params[1]));
    } else if (pathToRegexp(routes.share.main).test(pathname)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const token: string = pathToRegexp(routes.share.main).exec(pathname)![1];
      enterAction = sharePageEnterActions(token);
    }

    const isAuthorized: boolean = state$.value.Auth.authedUser !== undefined;
    const pathBeforeAuth: string | undefined = state$.value.Auth.pathBeforeAuth;

    // Store the last path user was intending to access
    // before they were asked to authorize.
    if (isUnauthRedirected && lastPath) {
      enterAction.push(ChangePathBeforeAuth({ path: lastPath }));
    }

    // Whenever the path is used to access, clear them
    // since the purpose has been fulfilled.
    if (pathBeforeAuth === pathname) {
      exitAction.push(ChangePathBeforeAuth({ path: undefined }));
    }

    // The flag only holds true when user is not authorized
    // to avoid storing path value when redirection happens after login,
    // since it should always redirect to routes.project.main.
    isUnauthRedirected = !isAuthorized && lastPath === '' && action.payload.isFirstRendering;

    // Reset lastPath to pathname since
    // the reference of the last path should be the current path now.
    lastPath = pathname;

    // When user refreshes the page, the CSS variables in the dom is reset.
    // Sync it back with the colors from the state.
    if (state$.value.PlanConfig.config?.primaryColor) {
      updatePrimaryColor(state$.value.PlanConfig.config.primaryColor);
    }

    return exitAction.concat(enterAction);
  }),
);

export const epic: Epic<Action, Action> = combineEpics(
  routeEpic,
);
