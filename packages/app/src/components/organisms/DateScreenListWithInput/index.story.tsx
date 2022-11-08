import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import { format } from 'date-fns';
import _ from 'lodash-es';
import React from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';

import { mockScreens } from '^/store/Mock';
import * as T from '^/types';
import { Formats } from '^/utilities/date-format';
import { withState } from '^/utilities/storybook-state.story';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { DateScreenListWithInput } from '.';

const Wrapper = styled.div({
  width: '254px',
  height: '666px',
});

const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);
const dates: Array<Date> = _.uniqBy(mockScreens.screens, (screen) => format(screen.appearAt, Formats.YYYYMMDD)).map((screen) => screen.appearAt);

interface State {
  currentDate?: Date;
  clickedScreenId?: T.Screen['id'];
  newScreen?: { appearAt: T.Screen['appearAt']; title?: T.Screen['title'] };
}

const story: StoryApi = storiesOf('Organisms|DateScreenListWithInput', module);

[T.CalendarScreenSize.S, T.CalendarScreenSize.M].map((size: Exclude<T.CalendarScreenSize, T.CalendarScreenSize.L>) => (
  story.add(size, withState<State>({})(({
    state,
    setState,
  }) => {
    const onScreenClick: (screen: T.Screen) => void = (screen) => setState((prev) => ({
      ...prev,
      clickedScreenId: screen.id,
      newScreen: undefined,
    }));

    const onNewScreenChange: (params: { appearAt: T.Screen['appearAt']; title: T.Screen['title'] }) => void = ({
      appearAt, title,
    }) => {
      setState((prev) => ({
        ...prev,
        clickedScreenId: undefined,
        newScreen: { appearAt, title },
      }));
    };

    const onDateChange: (date: Date) => void = (currentDate) => {
      setState((prev) => ({ ...prev, currentDate }));
    };

    return (
      <Provider store={store}>
        <Wrapper>
          <DateScreenListWithInput
            size={size}
            dates={dates}
            currentDate={state.currentDate}
            newScreen={state.newScreen}
            clickedScreenId={state.clickedScreenId}
            onDateChange={onDateChange}
            onScreenSelect={onScreenClick}
            onNewScreenChange={onNewScreenChange}
          />
        </Wrapper>
      </Provider>
    );
  }))
));
