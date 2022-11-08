import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';

import * as T from '^/types';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { CalendarWithHeader } from '.';


const Wrapper = styled.div({
  width: '200px',
  height: '300px',
});


const mockFunc: () => void = () => {};

storiesOf('Atoms|CalendarWithHeader', module)
  .add('default', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <Wrapper>
          <CalendarWithHeader
            mainCalendarType={T.CalendarType.FROM_2010_UNTIL_TODAY}
            currentDate={new Date()}
            subCalendarTitle={{ title: '안녕' }}
            isListable={true}
            areContentsDateChangable={true}
            onMainCalendarDayClick={mockFunc}
            onSubCalendarDayClick={mockFunc}
          />
        </Wrapper>
      </Provider>
    );
  });
