import { isSameDay } from 'date-fns/esm';
import React, { FC, ReactNode } from 'react';
import ScrollBars from 'react-custom-scrollbars';
import styled from 'styled-components';

import { DateItem } from '^/components/atoms/DateItem';
import palette from '^/constants/palette';
import * as T from '^/types';


const Root = styled.div({
  width: '100%',
  height: '100%',
});

const Wrapper = styled.div({
  width: '100%',

  '> div + div': {
    borderTop: `1px solid ${palette.CalendarScreen.divider.toString()}`,
  },
});


export interface Props {
  readonly size: T.CalendarScreenSize;
  readonly dates: Array<Date>;
  readonly clickedDate?: Date;
  onDateClick?(date: Date): void;
}

export const DateList: FC<Props> = ({
  size, dates, clickedDate, onDateClick,
}) => {
  const dateList: ReactNode = dates.map((date, key) => {
    const isClicked: boolean = clickedDate !== undefined ? isSameDay(date, clickedDate) : false;

    return (
      <DateItem
        key={key}
        size={size}
        date={date}
        isClicked={isClicked}
        onClick={onDateClick}
      />
    );
  });

  return (
    <Root>
      <ScrollBars>
        <Wrapper>
          {dateList}
        </Wrapper>
      </ScrollBars>
    </Root>
  );
};
