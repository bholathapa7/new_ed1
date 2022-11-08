import { Reducer } from 'redux';
import {
  action as makeAction,
  props,
  union,
} from 'tsdux';

import * as T from '^/types';

// Redux actions

export const ChangeFrontPageTab = makeAction(
  'ddm/pages/CHANGE_FRONT_PAGE_TAB',
  props<{
    readonly tab: T.FrontPageTabType;
  }>(),
);

export const ChangePasswordFormValues = makeAction(
  'ddm/pages/CHANGE_PASSWORD_FORM_VALUES',
  props<{
    readonly passwordFormValues: T.PasswordFormValues;
  }>(),
);

export const ChangeNewPasswordFormValues = makeAction(
  'ddm/pages/CHANGE_NEW_PASSWORD_FORM_VALUES',
  props<{
    readonly newPasswordFormValues: T.NewPasswordFormValues;
  }>(),
);

export const ChangeNewPasswordToken = makeAction(
  'ddm/pages/CHANGE_NEW_PASSWORD_TOKEN',
  props<{
    readonly newPasswordToken: T.FrontPageState['newPasswordToken'];
  }>(),
);

const Action = union([
  ChangeFrontPageTab,

  ChangePasswordFormValues,

  ChangeNewPasswordFormValues,

  ChangeNewPasswordToken,
]);
export type Action = typeof Action;


// Redux reducer
/**
 * @desc
 * There is no deep-level modification for this reducer,
 * so introducing lens does not help restructuring this.
 */
const initialState: T.FrontPageState = {
  tab: T.FrontPageTabType.LOGIN,
  passwordFormValues: {
    email: '',
  },
  newPasswordFormValues: {
    password: '',
    passwordConfirmation: '',
  },
  signUpFormValues: {
    avatar: undefined,
    email: '',
    password: '',
    passwordConfirmation: '',
    firstName: '',
    lastName: '',
    organization: '',
    contactNumber: '',
    country: 'Korea, Republic of',
    purpose: '',
    language: T.Language.KO_KR,
    eula: false,
  },
  signUpFormDirties: {
    avatar: false,
    email: false,
    password: false,
    passwordConfirmation: false,
    firstName: false,
    lastName: false,
    organization: false,
    contactNumber: false,
    country: false,
    purpose: false,
    language: true,
    eula: false,
  },
};
const reducer: Reducer<T.FrontPageState> = (
  state: T.FrontPageState = initialState, action: Action,
): T.FrontPageState => {
  switch (action.type) {
    case ChangeFrontPageTab.type:
      return {
        ...state,
        tab: action.tab,
      };
    case ChangePasswordFormValues.type:
      return {
        ...state,
        passwordFormValues: action.passwordFormValues,
      };
    case ChangeNewPasswordFormValues.type:
      return {
        ...state,
        newPasswordFormValues: action.newPasswordFormValues,
      };
    case ChangeNewPasswordToken.type:
      return {
        ...state,
        newPasswordToken: action.newPasswordToken,
      };
    default:
      return state;
  }
};
export default reducer;
