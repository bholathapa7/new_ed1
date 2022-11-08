import { useSelector } from 'react-redux';

import * as T from '^/types';

export const authedUserSelector: (state: T.State) => T.User | undefined
  = (state) => state.Auth.authedUser?.id !== undefined ? state.Users.users.byId[state.Auth.authedUser.id] : undefined;

export type AreUsersEqual<S extends T.User> = (prev: S, next: S) => boolean;

export const useAuthedUser: (areUsersEqual?: AreUsersEqual<T.User>) => T.User | undefined
  = (areUsersEqual) => useSelector(authedUserSelector, areUsersEqual);

export type UseAuthedUser = ReturnType<typeof useAuthedUser>;
