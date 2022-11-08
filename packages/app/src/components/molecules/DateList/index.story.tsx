import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import _ from 'lodash-es';
import React from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';

import { mockScreens } from '^/store/Mock';
import * as T from '^/types';
import { withState } from '^/utilities/storybook-state.story';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { DateList, Props } from './';

const Wrapper = styled.div({
  width: '274px',
  height: '100px',

  padding: '30px',
  backgroundColor: 'white',
});

const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

const mockDates: Array<Date> = _.uniq(mockScreens.screens.map((screen) => screen.appearAt.valueOf())).map((date) => new Date(date));

interface State {
  clickedDate?: Date;
}

const story: StoryApi = storiesOf('Atoms|DateList', module);

Object.values(T.CalendarScreenSize).map((size) => (
  story.add(size, withState<State>({
    clickedDate: undefined,
  })(({
    state, setState,
  }) => {
    const handleDateClick: NonNullable<Props['onDateClick']> = (date) => {
      setState({ clickedDate: date });
    };

    return (
      <Provider store={store}>
        <Wrapper>
          <DateList
            size={size}
            dates={mockDates}
            clickedDate={state.clickedDate}
            onDateClick={handleDateClick}
          />
        </Wrapper>
      </Provider>
    );
  }))
    .add(`${size} not clickable`, () => (
      <Provider store={store}>
        <Wrapper>
          <DateList
            size={size}
            dates={mockDates}
          />
        </Wrapper>
      </Provider>
    ))
));
