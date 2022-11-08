import { Epic, combineEpics } from 'redux-observable';
import { REHYDRATE } from 'redux-persist';
import { concat } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';
import { action as makeAction, union } from 'tsdux';
import { ofType } from 'tsdux-observable';

import * as T from '^/types';

import { ChangeProjectPageTab } from './Pages';
import { ChangeLanguage } from './Pages/Common';
import { GetProjects } from './Projects';
import { FinishGetUserInfo, GetUserInfo } from './Users';

import { getVendorUser } from './vendor';
import { insertUserToElasticApm } from './vendor/elasticApm';
import { insertUserToSentry } from './vendor/sentry';

const isDefined: <A>(a: A | null | undefined) => a is A = <A>(
  a: A | null | undefined,
  // eslint-disable-next-line eqeqeq
): a is A => a != undefined;


const FinishPersistEmbeddedTools = makeAction('ddm/persist/FINISH_PERSIST_EMBEDDED_TOOLS');

// Redux actions
const Action = union([
  GetUserInfo,
  GetProjects,
  ChangeLanguage,
  FinishPersistEmbeddedTools,
]);
export type Action =
  | { type: typeof REHYDRATE; [k: string]: any }
  | typeof Action;

const persistLanguageEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.ofType(REHYDRATE).pipe(
  map(() => state$.value.Auth.authedUser),
  filter(isDefined),
  mergeMap(({ id }) => concat(
    [GetUserInfo({ user: { id } })],
    action$.pipe(
      ofType(FinishGetUserInfo),
      map(() => state$.value.Users.users),
      filter(({ allIds }) => allIds.includes(id)),
      map(({ byId }) => byId[id].language),
      filter((language) => language !== undefined),
      map((language) => ({ language })),
      map(ChangeLanguage),
    ),
  )),
);

const persistProjectEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.ofType(REHYDRATE).pipe(
  () => action$.pipe(
    ofType(ChangeProjectPageTab),
    map(() => state$.value.Pages.Project.tab),
    filter((tab) => tab === T.ProjectPageTabType.MANAGE),
    map(() => state$.value.Permissions.permissions.allIds),
    filter((allIds) => allIds.length === 0),
    map(GetProjects),
  ),
);

const persistEmbeddedToolsEpic: Epic<Action, Action, T.State> = (
  action$, state$,
) => action$.ofType(REHYDRATE).pipe(
  () => action$.pipe(
    ofType(FinishGetUserInfo),
    map(() => getVendorUser(state$.value)),
    map((vendorUser) => {
      if (vendorUser) {
        [insertUserToSentry, insertUserToElasticApm].forEach((fn) => fn(vendorUser));
      }
    }),
    map(FinishPersistEmbeddedTools),
  ),
);

export const epic: Epic<Action, Action> = combineEpics(
  persistLanguageEpic,
  persistProjectEpic,
  persistEmbeddedToolsEpic,
);
