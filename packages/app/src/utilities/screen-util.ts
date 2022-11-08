import { isSameDay } from 'date-fns';
import _ from 'lodash-es';
import { useSelector } from 'react-redux';

import * as T from '^/types';

export const TEMP_SCREEN_ID: number = -1;

type OrderBy = 'desc' | 'asc';
export const getSortedScreens: (screens: T.Screen[], orderBy?: OrderBy) => T.Screen[] = (screens, orderBy = 'desc') => {
  const alphabeticalySortedScreens: T.Screen[] = _.orderBy(screens, 'createdAt', 'desc');

  return _.orderBy(alphabeticalySortedScreens, 'appearAt', orderBy);
};

/**
 * Get the initial empty screen to create when uploading sourcephoto.
 */
export const getInitialScreen: (title: T.Screen['title']) => T.Screen = (defaultTitle) => ({
  id: TEMP_SCREEN_ID,
  title: defaultTitle,
  contentIds: [],
  appearAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
});

/**
 * Get the first empty screen, i.e. without contents on the same day.
 * The criteria is simple now, in that it checks only when there's no content ids.
 * It can be expanded to maybe check if there's already a map or other cases.
 */
export const getFirstEmptyScreen: (screens: T.Screen[], customDate?: Date) => T.Screen | undefined = (screens, customDate) => {
  const date: Date = customDate ?? new Date();
  const screensFromDate: T.Screen[] = screens.filter((screen) => isSameDay(date, screen.appearAt));

  if (screensFromDate.length === 0) {
    return undefined;
  }

  return screensFromDate[0].contentIds.length === 0 ? screensFromDate[0] : undefined;
};

export const useFirstEmptyScreen: () => T.Screen | undefined = () => useSelector((s: T.State) => getFirstEmptyScreen(s.Screens.screens));
