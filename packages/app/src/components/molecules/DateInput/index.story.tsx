import { storiesOf } from '@storybook/react';
import React, { FC, useState } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';
import { UseState } from '^/hooks';
import * as T from '^/types';
import { DateInput } from '.';

const Wrapper = styled.div({
  width: '250px',
  backgroundColor: palette.white.toString(),

  marginTop: '50px',
  padding: '50px',
});

const Component: FC = () => {
  const [date, setDate]: UseState<Date | undefined> = useState<Date>();

  return (
    <Wrapper>
      <DateInput
        date={date}
        defaultDate={new Date()}
        calendarType={T.CalendarType.FROM_2010_UNTIL_TODAY}
        setDate={setDate}
      />
    </Wrapper>
  );
};

storiesOf('Molecules|DateInput', module)
  .add('default', () => <Component />);
