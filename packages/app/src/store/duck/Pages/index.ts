import { Reducer, combineReducers } from 'redux';
import { Epic, combineEpics } from 'redux-observable';

import { PagesState, State } from '^/types';

import CommonPageReducer, { Action as CommonPageAction } from './Common';
import ContentPageReducer, {
  Action as ContentPageAction,
  contentPageEpic as ContentPageEpic,
} from './Content';
import FrontPageReducer, { Action as FrontPageAction } from './Front';
import ProjectPageReducer, {
  Action as ProjectPageAction,
  projectPageEpic as ProjectPageEpic,
} from './Project';

export * from './Common';
export * from './Front';
export * from './Content';
export * from './Project';

export type Action
  = CommonPageAction
  | FrontPageAction
  | ContentPageAction
  | ProjectPageAction
;

export const rootEpic: Epic<Action, Action, State> = combineEpics<Action, Action, State>(
  ContentPageEpic,
  ProjectPageEpic,
);

const reducer: Reducer<PagesState> = combineReducers<PagesState>({
  Common: CommonPageReducer,
  Front: FrontPageReducer,
  Contents: ContentPageReducer,
  Project: ProjectPageReducer,
});
export default reducer;
