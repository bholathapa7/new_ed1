import { Reducer } from 'redux';
import { Epic, combineEpics } from 'redux-observable';
import { mergeMap } from 'rxjs/operators';
import {
  action as makeAction,
  props,
  union,
} from 'tsdux';
import { ofType } from 'tsdux-observable';

import { authedUserSelector } from '^/hooks/useAuthedUser';
import * as T from '^/types';
import { getCookie, setCookie } from '^/utilities/cookie';

const SIGN_UP_TUTORIAL_POPUP_COOKIE_KEY: string = 'isSignUpTutorialPopupHidden';

// Redux actions

export const ChangeProjectPageTab = makeAction(
  'ddm/pages/CHANGE_PROJECT_PAGE_TAB',
  props<{
    readonly tab: T.ProjectPageTabType;
  }>(),
);

export const OpenProjectPagePopup = makeAction(
  'ddm/pages/OPEN_PROJECT_PAGE_POPUP',
  props<{
    readonly popup: T.ProjectPagePopupType;
  }>(),
);

export const CloseProjectPagePopup = makeAction(
  'ddm/pages/CLOSE_PROJECT_PAGE_POPUP',
);

export const ChangeEditingProject = makeAction(
  'ddm/pages/CHANGE_EDITING_PROJECT',
  props<{
    readonly projectId?: T.Project['id'];
  }>(),
);

export const ShowSignUpTutorialPopup = makeAction(
  'ddm/pages/SHOW_SIGN_UP_TUTORIAL_POPUP',
);

export const HideSignUpTutorialPopup = makeAction(
  'ddm/pages/HIDE_SIGN_UP_TUTORIAL_POPUP',
  props<{
    readonly isKeepingHideAfterLogin: boolean;
  }>(),
);

export const ChangeMyPageFormValues = makeAction(
  'ddm/pages/CHANGE_MY_PAGE_FORM_VALUES',
  props<{
    readonly myPageFormValues: T.MyPageFormValues;
  }>(),
);

const Action = union([
  ChangeProjectPageTab,
  OpenProjectPagePopup,
  CloseProjectPagePopup,
  ChangeEditingProject,
  ChangeMyPageFormValues,

  ShowSignUpTutorialPopup,
  HideSignUpTutorialPopup,
]);
export type Action = typeof Action;


// Redux-Observable Epics
const showSignUpTutorialPopupEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(ShowSignUpTutorialPopup),
  mergeMap(() => {
    const isSignUpTutorialHiddenInCookie: string | undefined = getCookie(SIGN_UP_TUTORIAL_POPUP_COOKIE_KEY);
    const isSignUpTutorialPopupHidden: boolean = isSignUpTutorialHiddenInCookie === 'true'
      || Boolean(state$.value.Pages.Project.isSignUpTutorialPopupHidden);

    if (isSignUpTutorialPopupHidden) {
      return [];
    }

    if (isSignUpTutorialHiddenInCookie === undefined) {
      const authedUser: T.User | undefined = authedUserSelector(state$.value);

      // eslint-disable-next-line no-magic-numbers
      const tempDateForHidingSignUpTutorial: Date = new Date(2020, 9, 28, 16);

      if (authedUser !== undefined && authedUser.createdAt.valueOf() < tempDateForHidingSignUpTutorial.valueOf()) {
        setCookie(SIGN_UP_TUTORIAL_POPUP_COOKIE_KEY, 'true');

        return [];
      }
    }

    return [
      OpenProjectPagePopup({ popup: T.ProjectPagePopupType.SIGN_UP_TUTORIAL }),
    ];
  }),
);

const hideSignUpTutorialPopup: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.pipe(
  ofType(HideSignUpTutorialPopup),
  mergeMap(({ isKeepingHideAfterLogin }) => {
    if (isKeepingHideAfterLogin) {
      setCookie(SIGN_UP_TUTORIAL_POPUP_COOKIE_KEY, isKeepingHideAfterLogin.toString());
    }

    if (state$.value.Pages.Project.popup === T.ProjectPagePopupType.SIGN_UP_TUTORIAL) {
      return [CloseProjectPagePopup()];
    }

    return [];
  }),
);

export const projectPageEpic: Epic<Action, Action, T.State> = combineEpics(
  showSignUpTutorialPopupEpic,
  hideSignUpTutorialPopup,
);

// Redux reducer
/**
 * @desc
 * There is no deep-level modification for this reducer,
 * so introducing lens does not help restructuring this.
 */
const initialState: T.ProjectPageState = {
  tab: T.ProjectPageTabType.LIST,
  popup: undefined,
  myPageFormValues: {
    password: '',
    passwordConfirmation: '',
    organization: '',
    contactNumber: '',
    country: '',
    language: T.Language.EN_US,
    purpose: '',
  },
};
const reducer: Reducer<T.ProjectPageState> = (
  state = initialState, action: Action,
) => {
  switch (action.type) {
    case ChangeProjectPageTab.type:
      return {
        ...state,
        tab: action.tab,
      };
    case OpenProjectPagePopup.type:
      return {
        ...state,
        popup: action.popup,
      };
    case CloseProjectPagePopup.type:
      return {
        ...state,
        popup: undefined,
      };
    case ChangeEditingProject.type:
      return {
        ...state,
        editingProjectId: action.projectId,
      };
    case ChangeMyPageFormValues.type:
      return {
        ...state,
        myPageFormValues: action.myPageFormValues,
      };
    case HideSignUpTutorialPopup.type:
      return {
        ...state,
        isSignUpTutorialPopupHidden: true,
      };
    default:
      return state;
  }
};
export default reducer;
