import React, { FC, ReactNode } from 'react';
import styled, { CSSObject } from 'styled-components';

import RawArrowSVG from '^/assets/icons/date-screen/arrow.svg';
import { DateItem } from '^/components/atoms/DateItem';
import palette from '^/constants/palette';
import * as T from '^/types';
import { ScreenListWithInput } from '../ScreenListWithInput';


type StyleElementKey = 'toggleIcon';
type StyleBySize = { [K in Props['size']]: CSSObject };
type StylesBySize = { [K in StyleElementKey]: StyleBySize };

const stylesBySize: StylesBySize = {
  toggleIcon: {
    [T.CalendarScreenSize.S]: {
      right: '15px',
    },
    [T.CalendarScreenSize.M]: {
      right: '24px',
    },
  },
};

interface ToggleProps {
  size: Props['size'];
  isToggled: boolean;
}

const Root = styled.div({
  width: '100%',
});

const ToggleableDateItem = styled.div({
  position: 'relative',

  width: '100%',

  borderBottom: `1px solid ${palette.CalendarScreen.divider.toString()}`,
});

const ToggleIcon = styled(RawArrowSVG)<ToggleProps>(({ size, isToggled }: ToggleProps) => ({
  position: 'absolute',
  top: '50%',

  transform: `translateY(-50%) rotate(${isToggled ? '180deg' : '0deg'})`,

  ...stylesBySize.toggleIcon[size],
}));


export interface Props {
  readonly size: Exclude<T.CalendarScreenSize, T.CalendarScreenSize.L>;
  readonly date: T.Screen['appearAt'];
  readonly screenTitle?: T.Screen['title'];
  readonly clickedScreenId?: T.Screen['id'];
  readonly isToggled: boolean;
  readonly hasError?: boolean;
  onToggle(isToggled: boolean): void;
  onScreenClick?(screen: T.Screen): void;
  onNewScreenChange(param: ({ appearAt: T.Screen['appearAt']; title: T.Screen['title'] })): void;
  onClose?(): void;
  onError?(hasError: boolean): void;
}

export const DateScreenItemWithInput: FC<Props> = ({
  size, screenTitle, clickedScreenId, date, isToggled, hasError,
  onToggle, onScreenClick, onNewScreenChange, onClose, onError,
}) => {
  const handleDateClick: () => void = () => {
    onToggle(!isToggled);
  };

  const screenList: ReactNode = isToggled ? (
    <ScreenListWithInput
      size={size}
      appearAt={date}
      clickedScreenId={clickedScreenId}
      title={screenTitle}
      hasError={hasError}
      onScreenClick={onScreenClick}
      onNewScreenChange={onNewScreenChange}
      onClose={onClose}
      onError={onError}
    />
  ) : undefined;

  return (
    <Root>
      <ToggleableDateItem>
        <DateItem
          size={size}
          date={date}
          onClick={handleDateClick}
        />
        <ToggleIcon size={size} />
      </ToggleableDateItem>
      {screenList}
    </Root>
  );
};
