import React, { FC, ReactNode, useCallback } from 'react';
import styled from 'styled-components';

import { ScreenItem } from '^/components/atoms/ScreenItem';
import palette from '^/constants/palette';
import { QueryContentWithTypeAndScreenId, QueryScreensWithDate, typeGuardMap, useGetAllScreensOf, useGetContentOf } from '^/hooks';
import { PatchContent } from '^/store/duck/Contents';
import * as T from '^/types';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';


const Root = styled.div({
  textAlign: 'initial',
  '> div': {
    borderBottom: `1px solid ${palette.CalendarScreen.divider.toString()}`,
  },
});


export interface Props {
  readonly size: T.CalendarScreenSize;
  readonly appearAt?: Date;
  readonly clickedScreenId?: T.Screen['id'];
  readonly isListShown?: boolean;
  onScreenClick?(screen: T.Screen): void;
  onClose?(): void;
  onError?(hasError: boolean): void;
}

export const ScreenList: FC<Props> = ({
  size, appearAt, clickedScreenId,
  onScreenClick, onClose, onError,

  isListShown = true,
}) => {
  const getScreensOf: QueryScreensWithDate = useGetAllScreensOf(T.ScreensQueryParam.DATE);
  const dispatch: Dispatch = useDispatch();

  const isIn2D: boolean = useSelector((state: T.State) => !state.Pages.Contents.in3D && !state.Pages.Contents.in3DPointCloud);

  const getContentOf: QueryContentWithTypeAndScreenId = useGetContentOf(T.ContentsQueryParam.TYPE_AND_SCREENID);
  if (appearAt === undefined) return null;

  const screens: Array<T.Screen> = getScreensOf(appearAt);
  const isScreenClickable: boolean = Boolean(onScreenClick);

  const handleScreenClick: ((screen: T.Screen) => void) | undefined = isScreenClickable ? (screen) => {
    const map: T.MapContent | undefined = typeGuardMap(getContentOf(T.ContentType.MAP, screen.id));
    if (isIn2D && map?.config?.selectedAt === undefined) select(map);
    onScreenClick?.(screen);
    onError?.(false);
    onClose?.();
  } : undefined;

  const screenList: ReactNode = isListShown ? screens.map((screen) => (
    <ScreenItem
      key={screen.id}
      size={size}
      screenId={screen.id}
      isClicked={screen.id === clickedScreenId}
      onClick={handleScreenClick}
    />
  )) : undefined;

  const select: (map: T.MapContent | undefined) => void = useCallback((map) => {
    if (map === undefined) return;
    dispatch(PatchContent({
      content: {
        id: map.id,
        config: {
          selectedAt: new Date(),
        },
      },
    }));
  }, []);

  return (
    <Root>
      {screenList}
    </Root>
  );
};
