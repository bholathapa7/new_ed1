import React, { FC, ReactNode } from 'react';
import styled, { CSSObject } from 'styled-components';

import RawArrowSVG from '^/assets/icons/date-screen/arrow.svg';
import { DateItem } from '^/components/atoms/DateItem';
import { ScreenList } from '^/components/molecules/ScreenList';
import palette from '^/constants/palette';
import { QueryScreensWithDate, useGetAllScreensOf } from '^/hooks';
import * as T from '^/types';


interface ToggleProps {
  size: T.CalendarScreenSize;
  isToggled: boolean;
}

const Wrapper = styled.div({
  width: '100%',
});

const ToggleableDateItem = styled.div({
  position: 'relative',

  width: '100%',

  borderBottom: `1px solid ${palette.CalendarScreen.divider.toString()}`,
});

const ToggleIconStyleBySize: { [K in T.CalendarScreenSize]: CSSObject } = ({
  [T.CalendarScreenSize.S]: {
    right: '15px',
  },
  [T.CalendarScreenSize.M]: {
    right: '24px',
  },
  [T.CalendarScreenSize.L]: {
    right: '27.5px',
  },
});

const ToggleIcon = styled(RawArrowSVG)<ToggleProps>(({ size, isToggled }: ToggleProps) => ({
  position: 'absolute',
  top: '50%',

  transform: `translateY(-50%) rotate(${isToggled ? '180deg' : '0deg'})`,

  ...ToggleIconStyleBySize[size],
}));

const DateItemWrapper = styled.div({
  width: '100%',

  borderBottom: `1px solid ${palette.CalendarScreen.divider.toString()}`,
});


export interface Props {
  readonly size: T.CalendarScreenSize;
  readonly clickedScreenId?: T.Screen['id'];
  readonly date: Date;
  readonly isDateToggled: boolean;
  readonly isDateToggleable?: boolean;
  onScreenClick?(screen: T.Screen): void;
  onDateToggle(isToggled: boolean): void;
}

export const DateScreenItem: FC<Props> = ({
  size, clickedScreenId, date, isDateToggled,
  onScreenClick, onDateToggle,

  isDateToggleable = true,
}) => {
  const getScreensByDate: QueryScreensWithDate = useGetAllScreensOf(T.ScreensQueryParam.DATE);

  const screens: Array<T.Screen> = getScreensByDate(date);
  const isDateClicked: boolean = isDateToggleable ? false : screens.some((screen) => screen.id === clickedScreenId);

  const handleDateClick: () => void = () => {
    onDateToggle(!isDateToggled);
  };

  const screenList: ReactNode = (isDateToggleable && isDateToggled) ? (
    <ScreenList
      size={size}
      appearAt={date}
      clickedScreenId={clickedScreenId}
      onScreenClick={onScreenClick}
    />
  ) : undefined;

  const dateScreenItem: ReactNode = isDateToggleable ? (
    <>
      <ToggleableDateItem>
        <DateItem
          size={size}
          date={date}
          onClick={handleDateClick}
        />
        <ToggleIcon size={size} isToggled={isDateToggled} />
      </ToggleableDateItem>
      {screenList}
    </>
  ) : (
    <DateItemWrapper>
      <DateItem
        size={size}
        date={date}
        isClicked={isDateClicked}
        onClick={handleDateClick}
      />
    </DateItemWrapper>
  );

  return (
    <Wrapper>
      {dateScreenItem}
    </Wrapper>
  );
};
