import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';

import * as T from '^/types';
import { withState } from '^/utilities/storybook-state.story';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { DateScreenItem } from '.';

const Wrapper = styled.div({
  width: '237px',
  height: '400px',

  margin: '50px',
  padding: '50px',

  backgroundColor: 'white',
});

const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);
// eslint-disable-next-line no-magic-numbers
const dateWithSingleScreen: Date = new Date(2020, 6, 20);
const dateWithScreens: Date = new Date();

interface State {
  isToggled: boolean;
  clickedScreenId?: T.Screen['id'];
}

const story: StoryApi = storiesOf('Molecules|DateScreenItem', module);

Object.values(T.CalendarScreenSize).map((size) => (
  story.add(`${size} single screen`, withState<State>({
    isToggled: false,
    clickedScreenId: undefined,
  })(({
    state,
    setState,
  }) => {
    const onDateToggle: (isToggled: boolean) => void = (isToggled) => setState((prevProps) => ({
      ...prevProps,
      isToggled,
    }));
    const onScreenClick: (screen: T.Screen) => void = (screen) => setState((prevProps) => ({
      ...prevProps,
      clickedScreenId: screen.id,
    }));

    return (
      <Provider store={store}>
        <Wrapper>
          <DateScreenItem
            size={size}
            date={dateWithSingleScreen}
            isDateToggled={state.isToggled}
            clickedScreenId={state.clickedScreenId}
            onDateToggle={onDateToggle}
            onScreenClick={onScreenClick}
          />
        </Wrapper>
      </Provider>
    );
  }))
    .add(`${size} multiple screens`, withState<State>({
      isToggled: false,
      clickedScreenId: undefined,
    })(({
      state,
      setState,
    }) => {
      const onDateToggle: (isToggled: boolean) => void = (isToggled) => setState((prevProps) => ({
        ...prevProps,
        isToggled,
      }));
      const onScreenClick: (screen: T.Screen) => void = (screen) => setState((prevProps) => ({
        ...prevProps,
        clickedScreenId: screen.id,
      }));

      return (
        <Provider store={store}>
          <Wrapper>
            <DateScreenItem
              size={size}
              date={dateWithScreens}
              isDateToggled={state.isToggled}
              clickedScreenId={state.clickedScreenId}
              onDateToggle={onDateToggle}
              onScreenClick={onScreenClick}
            />
          </Wrapper>
        </Provider>
      );
    }))
));
