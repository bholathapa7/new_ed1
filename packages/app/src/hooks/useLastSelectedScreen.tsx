import * as T from '^/types';
import { useSelector } from 'react-redux';

export function lastSelectedScreenSelector(s: T.State): T.Screen | undefined {
  const screens: T.Screen[] = s.Screens.screens;
  const lastSelectedScreenId: number | undefined = s.ProjectConfigPerUser.config?.lastSelectedScreenId;

  if (lastSelectedScreenId === undefined) return;

  return screens.find(({ id }) => id === lastSelectedScreenId);
}

export type AreScreensEqual<S extends T.Screen> = (prev: S, next: S) => boolean;

export function useLastSelectedScreen(areScreensEqual?: AreScreensEqual<T.Screen>): T.Screen | undefined {
  return useSelector(lastSelectedScreenSelector, areScreensEqual);
}

export type UseLastSelectedScreen = ReturnType<typeof useLastSelectedScreen>;
