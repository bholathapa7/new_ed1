import { isSameDay } from 'date-fns/esm';
import React, { FC, ReactNode, useEffect, useState } from 'react';
import styled from 'styled-components';

import { DateScreenItemWithInput } from '^/components/molecules/DateScreenItemWithInput';
import { UseState } from '^/hooks';
import * as T from '^/types';
import Scrollbars from 'react-custom-scrollbars';


const Root = styled.div({
  width: '100%',
  height: '100%',
});


export interface Props {
  readonly size: Exclude<T.CalendarScreenSize, T.CalendarScreenSize.L>;
  readonly dates: Array<Date>;
  readonly currentDate?: Date;
  readonly newScreen?: { appearAt: T.Screen['appearAt']; title?: T.Screen['title'] };
  readonly clickedScreenId?: T.Screen['id'];
  readonly hasError?: boolean;
  onDateChange(date: Date): void;
  onScreenSelect?(screen: T.Screen): void;
  onNewScreenChange(param: ({ appearAt: T.Screen['appearAt']; title?: T.Screen['title'] })): void;
  onClose?(): void;
  onError?(hasError: boolean): void;
}

export const DateScreenListWithInput: FC<Props> = ({
  size, dates, currentDate, newScreen, clickedScreenId, hasError,
  onDateChange, onScreenSelect, onNewScreenChange, onClose, onError,
}) => {
  const [toggledDate, setToggledDate]: UseState<Date | undefined> = useState<Date | undefined>(currentDate);

  useEffect(() => {
    setToggledDate(currentDate);
  }, [currentDate]);

  const screenList: ReactNode = dates.map((date, key) => {
    const screenTitle: string | undefined = newScreen !== undefined && isSameDay(newScreen.appearAt, date) ? newScreen.title : undefined;
    const isToggled: boolean = toggledDate !== undefined ? isSameDay(toggledDate, date) : false;

    const onToggle: (isToggled: boolean) => void = (nextIsToggled) => {
      if (nextIsToggled) {
        onDateChange(date);
      }

      setToggledDate(nextIsToggled ? date : undefined);
      onNewScreenChange({
        title: newScreen?.title,
        appearAt: date,
      });
    };

    return (
      <DateScreenItemWithInput
        key={key}
        size={size}
        date={date}
        screenTitle={screenTitle}
        clickedScreenId={clickedScreenId}
        isToggled={isToggled}
        hasError={hasError}
        onToggle={onToggle}
        onScreenClick={onScreenSelect}
        onNewScreenChange={onNewScreenChange}
        onClose={onClose}
        onError={onError}
      />
    );
  });

  return (
    <Root>
      <Scrollbars>
        {screenList}
      </Scrollbars>
    </Root>
  );
};
