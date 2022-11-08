import { Reducer } from 'redux';
import {
  action as makeAction,
  props,
  union,
} from 'tsdux';

import * as T from '^/types';

// Redux actions

export const ChangeLanguage = makeAction(
  'ddm/pages/CHANGE_LANGUAGE',
  props<{
    readonly language: T.Language;
  }>(),
);

const Action = union([
  ChangeLanguage,
]);
export type Action = typeof Action;


// Redux reducer
const initialState: T.CommonPageState = {
  language: navigator.language.includes('ko') ? T.Language.KO_KR : T.Language.EN_US,
  timezoneOffset: new Date().getTimezoneOffset(),
};
const reducer: Reducer<T.CommonPageState> = (
  state = initialState, action: Action,
) => {
  if (action.type === ChangeLanguage.type) {
    return {
      ...state,
      language: action.language,
    };
  }

  return state;
};
export default reducer;
