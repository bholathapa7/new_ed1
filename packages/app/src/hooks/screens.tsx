import { isSameDay } from 'date-fns/esm';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';

import { defaultScreenMap } from '^/constants/screen';
import { PatchProjectConfig } from '^/store/duck/ProjectConfig';
import { DeleteScreen } from '^/store/duck/Screens';
import * as T from '^/types';
import { Formats, formatWithOffset } from '^/utilities/date-format';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { getSortedScreens } from '^/utilities/screen-util';
import { UseL10n, useL10n } from '.';
import { QueryContentWithId, QueryContentsWithType, typeGuardDSMs, typeGuardMaps, useGetAllContentsOf, useGetContentOf } from './contents';

type QueryParam = T.ScreensQueryParam.TITLE_AND_DATE | T.ScreensQueryParam.ID | T.ScreensQueryParam.CONTENT_ID;
export type QueryScreenWithContentId = (givenContentId: T.Content['id']) => T.Screen | undefined;
export type QueryScreenWithId = (givenId: T.Screen['id']) => T.Screen | undefined;
export type QueryScreenWithTitleAndDate = (givenTitle: T.Screen['title'], givenDate: T.Screen['appearAt']) => T.Screen | undefined;

type Query = QueryScreenWithId | QueryScreenWithTitleAndDate | QueryScreenWithContentId;

export function useGetScreenOf(queryParam: T.ScreensQueryParam.CONTENT_ID): QueryScreenWithContentId;
export function useGetScreenOf(queryParam: T.ScreensQueryParam.ID): QueryScreenWithId;
export function useGetScreenOf(queryParam: T.ScreensQueryParam.TITLE_AND_DATE): QueryScreenWithTitleAndDate;
export function useGetScreenOf(queryParam: QueryParam): Query | undefined {
  const { Screens: { screens } }: T.State = useSelector((s: T.State) => s);
  const getContentOf: QueryContentWithId = useGetContentOf(T.ContentsQueryParam.ID);

  return getScreenOf(queryParam, screens, getContentOf);
}

export function getScreenOf(queryParam: QueryParam, screens: T.Screen[], getContentOf?: QueryContentWithId): Query | undefined {
  switch (queryParam) {
    case T.ScreensQueryParam.ID:
      return (givenId: T.Screen['id']) => screens.find((s) => s.id === givenId);

    case T.ScreensQueryParam.TITLE_AND_DATE:
      return (givenTitle: T.Screen['title'], givenDate: T.Screen['appearAt']) =>
        screens.find((s) => isSameDay(s.appearAt, givenDate) && s.title === givenTitle);

    case T.ScreensQueryParam.CONTENT_ID:
      return (givenContentId: T.Content['id']) =>
        screens.find((s) => getContentOf && s.id === getContentOf(givenContentId)?.screenId);

    default:
      return exhaustiveCheck(queryParam);
  }
}

export function getLastCreatedScreenId(screens: T.Screen[]): T.Screen['id'] | undefined {
  return getSortedScreens(screens, 'desc')[0]?.id;
}

export function useGetLastCreatedScreenId(): T.Screen['id'] | undefined {
  return useSelector((state: T.State) => getLastCreatedScreenId(state.Screens.screens));
}

/**
 * @desc For non-hooks
 */
export function _getScreenOfId(screenId: T.Screen['id'], screens: T.Screen[]): T.Screen | undefined {
  return (getScreenOf(T.ScreensQueryParam.ID, screens) as QueryScreenWithId)(screenId);
}

type QueryAllParam = T.ScreensQueryParam.DATE;
export type QueryScreensWithDate = (givenDate: T.Screen['appearAt']) => Array<T.Screen>;

type QueryAll = QueryScreensWithDate;

export function useGetAllScreensOf(queryParam: T.ScreensQueryParam.DATE): QueryScreensWithDate;
export function useGetAllScreensOf(queryParam: QueryAllParam): QueryAll | undefined {
  const { Screens: { screens } }: T.State = useSelector((s: T.State) => s);

  switch (queryParam) {
    case T.ScreensQueryParam.DATE:
      return (givenDate: T.Screen['appearAt']) => screens.filter((s) => isSameDay(s.appearAt, givenDate));

    default:
      return exhaustiveCheck(queryParam);
  }
}

export type UseIsDefaultScreenTitle = (title: T.Screen['title']) => boolean;
export function useIsDefaultScreenTitle(): UseIsDefaultScreenTitle {
  const [l10n]: UseL10n = useL10n();

  return (title: T.Screen['title']) => {
    const defaultScreenTitleRegex: RegExp = new RegExp(`^${l10n(defaultScreenMap.title).replace(/\s/g, '')}(\\d+)?$`, 'g');

    return Boolean(title.replace(/\s/g, '').match(defaultScreenTitleRegex));
  };
}

export type UseGetDefaultScreenTitle = (date: T.Screen['appearAt']) => T.Screen['title'];
export function useGetDefaultScreenTitle(): UseGetDefaultScreenTitle {
  const { Screens: { screens } }: T.State = useSelector((s: T.State) => s);
  const [l10n]: UseL10n = useL10n();

  return (date: T.Screen['appearAt']) => {
    const defaultScreenTitleRegex: RegExp = new RegExp(`^${l10n(defaultScreenMap.title).replace(/\s/g, '')}(\\d+)?$`, 'g');

    const numOfScreenWithDefaultTitle: number = screens.filter((s) =>
      isSameDay(s.appearAt, date) && s.title.replace(/\s/g, '').match(defaultScreenTitleRegex),
    ).length;

    const newDefaultScreenTitle: T.Screen['title'] =
      screens.some((s) =>
        isSameDay(s.appearAt, date) && s.title === `${l10n(defaultScreenMap.title)} ${numOfScreenWithDefaultTitle + 1}`) ?
        `${l10n(defaultScreenMap.title)} ${numOfScreenWithDefaultTitle + 2}` :
        `${l10n(defaultScreenMap.title)} ${numOfScreenWithDefaultTitle + 1}`;

    return numOfScreenWithDefaultTitle === 0 ?
      l10n(defaultScreenMap.title) :
      newDefaultScreenTitle;
  };
}

export type UseGetScreenDateAndTitle = (givenScreenId: T.Screen['id'], givenFormat?: Formats) => {formattedDate: string; title: string} | {};
export function useGetScreenDateAndTitle(): UseGetScreenDateAndTitle {
  const { Pages: { Common: { timezoneOffset } } }: T.State = useSelector((s: T.State) => s);

  const _getScreenOf: QueryScreenWithId = useGetScreenOf(T.ScreensQueryParam.ID);

  return (givenScreenId: T.Screen['id'], givenFormat?: Formats) => {
    const screen: T.Screen | undefined = _getScreenOf(givenScreenId);
    if (screen === undefined) return {};

    return {
      date: formatWithOffset(timezoneOffset, screen.appearAt, givenFormat !== undefined ? givenFormat : Formats.YYMMDD).replace(/\s/g, ''),
      title: screen.title,
    };
  };
}

export type UseDeleteScreen = (givenScreenId: T.Screen['id']) => void;
export function useDeleteScreen(): UseDeleteScreen {
  const { Pages: { Contents: { projectId } }, Screens: { screens } }: T.State = useSelector((s: T.State) => s);
  const dispatch: Dispatch = useDispatch();
  const _getScreenOf: QueryScreenWithId = useGetScreenOf(T.ScreensQueryParam.ID);

  return (givenScreenId: T.Screen['id']) => {
    if (projectId === undefined) return;

    const currentScreenIdx: number = screens.findIndex((s) => s.id === givenScreenId);
    const currentScreen: T.Screen | undefined = _getScreenOf(givenScreenId);
    if (currentScreen === undefined) return;

    const screensWithoutCurrentScreen: Array<T.Screen> = screens.filter((s) => s.id !== currentScreen.id);

    let screenToShow: T.Screen['id'] = 0;

    const isLastScreen: boolean = screens.length === 1;
    const isCurrentDateHasScreen: boolean = screensWithoutCurrentScreen.filter((s) => isSameDay(s.appearAt, currentScreen.appearAt)).length > 0;
    const isFutureDateHasScreen: boolean = Boolean(screens[currentScreenIdx + 1]);
    const isPastDateHasScreen: boolean = Boolean(screens[currentScreenIdx - 1]);

    if (isLastScreen) return;

    if (isCurrentDateHasScreen) {
      const currentDate: T.Screen['appearAt'] = currentScreen.appearAt;
      screenToShow = sortScreenAlphabeticalyWithTitle(screensWithoutCurrentScreen.filter((s) => isSameDay(s.appearAt, currentDate)))[0].id;
    } else if (isFutureDateHasScreen) {
      const firstDateInFuture: T.Screen['appearAt'] = screens[currentScreenIdx + 1].appearAt;
      screenToShow = sortScreenAlphabeticalyWithTitle(screensWithoutCurrentScreen.filter((s) => isSameDay(s.appearAt, firstDateInFuture)))[0].id;
    } else if (isPastDateHasScreen) {
      const firstDateInPast: T.Screen['appearAt'] = screens[currentScreenIdx - 1].appearAt;
      screenToShow = sortScreenAlphabeticalyWithTitle(screensWithoutCurrentScreen.filter((s) => isSameDay(s.appearAt, firstDateInPast)))[0].id;
    } else return;


    dispatch(DeleteScreen({ screenId: givenScreenId }));
    dispatch(PatchProjectConfig({ projectId, config: { lastSelectedScreenId: screenToShow } }));
  };
}

function sortScreenAlphabeticalyWithTitle(screens: Array<T.Screen>): Array<T.Screen> {
  return screens.sort((s1, s2) => s1.title.replace(/\s/g, '').localeCompare(s2.title.replace(/\s/g, '')));
}

/* eslint-disable brace-style */
export function typeGuardScreenId(screenId: T.Screen['id'] | undefined): T.Screen['id'] {
  if (!isScreenId(screenId)) throw new Error('ScreenId shouldn\'t be empty');

  return screenId;
}
export function typeGuardScreen(screen: T.Screen | undefined): T.Screen {
  if (!isScreen(screen)) throw new Error('Screen shouldn\'t be empty');

  return screen;
}

function isScreenId(screenId: T.Screen['id'] | undefined): screenId is T.Screen['id'] { return screenId !== undefined; }
function isScreen(screen: T.Screen | undefined): screen is T.Screen { return screen !== undefined; }

export const useSortedAvailbleDsmScreens: () => T.Screen[] = () => {
  const getAllContentsOf: QueryContentsWithType = useGetAllContentsOf(T.ContentsQueryParam.TYPE);
  const _getScreenOf: QueryScreenWithId = useGetScreenOf(T.ScreensQueryParam.ID);
  const dsms: T.DSMContent[] = typeGuardDSMs(getAllContentsOf(T.ContentType.DSM));
  const screens: T.Screen[] = [...new Set(dsms.map((d) => d.screenId).map(_getScreenOf).filter(isScreen))];

  return getSortedScreens(screens, 'desc');
};

export const useSortedAvailbleMapScreens: () => T.Screen[] = () => {
  const getAllContentsOf: QueryContentsWithType = useGetAllContentsOf(T.ContentsQueryParam.TYPE);
  const _getScreenOf: QueryScreenWithId = useGetScreenOf(T.ScreensQueryParam.ID);
  const maps: T.MapContent[] = typeGuardMaps(getAllContentsOf(T.ContentType.MAP));
  const screens: T.Screen[] = [...new Set(maps.map((d) => d.screenId).map(_getScreenOf).filter(isScreen))];

  return getSortedScreens(screens, 'desc');
};
