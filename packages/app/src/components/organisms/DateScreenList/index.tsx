import _ from 'lodash-es';
import React, { FC, ReactNode, useLayoutEffect, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import styled from 'styled-components';

import { DateScreenItem } from '^/components/molecules/DateScreenItem';
import { QueryScreensWithDate, UseIsDefaultScreenTitle, UseState, useGetAllScreensOf, useIsDefaultScreenTitle } from '^/hooks';
import * as T from '^/types';


const Wrapper = styled.div({
  width: '100%',
  height: '100%',
});


export interface Props {
  readonly size: T.CalendarScreenSize;
  readonly dates: Array<T.Screen['appearAt']>;
  readonly clickedScreenId?: T.Screen['id'];
  onScreenClick?(screen: T.Screen): void;
  onClose?(): void;
}

export const DateScreenList: FC<Props> = ({
  size, dates, clickedScreenId,
  onScreenClick, onClose,
}) => {
  const [toggledDates, setToggledDates]: UseState<Array<boolean | undefined>> = useState<Array<boolean>>([]);

  const getAllScreensOf: QueryScreensWithDate = useGetAllScreensOf(T.ScreensQueryParam.DATE);
  const isScreenDefaultTitle: UseIsDefaultScreenTitle = useIsDefaultScreenTitle();

  const isAllDateHasOneDefaultScreen: boolean = dates
    .map(getAllScreensOf)
    .every((screens) => screens.length === 1 && isScreenDefaultTitle(screens[0].title));
  const isScreenClickable: boolean = Boolean(onScreenClick);

  useLayoutEffect(() => {
    if (isAllDateHasOneDefaultScreen) return;

    setToggledDates([...dates.map(() => true)]);
  }, []);

  const handleScreenClick: ((screen: T.Screen) => void) | undefined = isScreenClickable ? (screen) => {
    onScreenClick?.(screen);
    onClose?.();
  } : undefined;

  const dateScreenList: ReactNode = dates.map((date, index) => {
    const isDateToggled: boolean = Boolean(toggledDates[index]);

    const onDateToggle: (isToggled: boolean) => void = (isToggled) => {
      if (isAllDateHasOneDefaultScreen) {
        const firstScreenInClickedDate: T.Screen = getAllScreensOf(date)[0];
        handleScreenClick?.(firstScreenInClickedDate);

        return;
      }

      setToggledDates((prevState) => {
        const _toggledDates: typeof prevState = [...prevState];
        _toggledDates[index] = isToggled;

        return _toggledDates;
      });
    };

    return (
      <DateScreenItem
        key={index}
        size={size}
        date={date}
        isDateToggled={isDateToggled}
        isDateToggleable={!isAllDateHasOneDefaultScreen}
        clickedScreenId={clickedScreenId}
        onScreenClick={handleScreenClick}
        onDateToggle={onDateToggle}
      />
    );
  });

  return (
    <Wrapper>
      <Scrollbars>
        {dateScreenList}
      </Scrollbars>
    </Wrapper>
  );
};
