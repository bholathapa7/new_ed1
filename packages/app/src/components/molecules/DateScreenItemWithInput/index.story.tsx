import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';

import * as T from '^/types';
import { withState } from '^/utilities/storybook-state.story';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { DateScreenItemWithInput } from '.';

interface State {
  isToggled: boolean;
  newScreen?: {
    title?: T.Screen['title'];
    appearAt: T.Screen['appearAt'];
  };
  clickedScreenId?: T.Screen['id'];
}

const Wrapper = styled.div({
  width: '336px',
  margin: '20px',
});

const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

const story: StoryApi = storiesOf('Molecules|DateScreenItemWithInput', module);

[T.CalendarScreenSize.S, T.CalendarScreenSize.M].map((size: Exclude<T.CalendarScreenSize, T.CalendarScreenSize.L>) => {
  story.add(size, withState<State>({
    isToggled: false,
  })(({
    state,
    setState,
  }) => {
    const onToggle: (isToggled: boolean) => void = (isToggled) => {
      setState((prev) => ({ ...prev, isToggled }));
    };
    const onScreenTitleChange: (params: ({ title: T.Screen['title']; appearAt: T.Screen['appearAt'] })) => void = ({
      title, appearAt,
    }) => {
      setState((prev) => ({ ...prev, clickedScreenId: undefined, newScreen: {
        title, appearAt,
      } }));
    };
    const onScreenClick: (screen: T.Screen) => void = (screen) => {
      setState((prev) => ({ ...prev, newScreen: undefined, clickedScreenId: screen.id }));
    };

    return (
      <Provider store={store}>
        <Wrapper>
          <DateScreenItemWithInput
            size={size}
            date={new Date()}
            screenTitle={state.newScreen?.title}
            clickedScreenId={state.clickedScreenId}
            isToggled={state.isToggled}
            onToggle={onToggle}
            onNewScreenChange={onScreenTitleChange}
            onScreenClick={onScreenClick}
          />
        </Wrapper>
      </Provider>
    );
  }));
});
