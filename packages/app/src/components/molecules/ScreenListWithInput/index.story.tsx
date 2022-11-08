import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';

import { NewScreen } from '^/components/organisms/ScreenPicker';
import * as T from '^/types';
import { withState } from '^/utilities/storybook-state.story';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { ScreenListWithInput } from '.';

const Wrapper = styled.div({
  width: '267px',
  padding: '20px',

  backgroundColor: '#ffffff',
});

const appearAt: Date = new Date();

const story: StoryApi = storiesOf('Molecules|ScreenListWithInput', module);
const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

interface State {
  title?: T.Screen['title'];
  clickedScreenId?: T.Screen['id'];
}

[T.CalendarScreenSize.S, T.CalendarScreenSize.M].map((size: Exclude<T.CalendarScreenSize, T.CalendarScreenSize.L>) => {
  story.add(size, withState<State>({
    title: undefined,
    clickedScreenId: undefined,
  })(({ state, setState }) => {
    const onNewScreenChange: (screen: NewScreen) => void = (screen) => {
      setState((prev) => ({
        ...prev,
        title: screen.title,
      }));
    };
    const onScreenClick: (screen: T.Screen) => void = (screen) => {
      setState(() => ({ title: undefined, clickedScreenId: screen.id }));
    };

    return (
      <Provider store={store}>
        <Wrapper>
          <ScreenListWithInput
            size={size}
            appearAt={appearAt}
            title={state.title}
            clickedScreenId={state.clickedScreenId}
            onNewScreenChange={onNewScreenChange}
            onScreenClick={onScreenClick}
          />
        </Wrapper>
      </Provider>
    );
  }));

  story.add(`${size} - screen not clickable`, withState<State>({
    title: undefined,
    clickedScreenId: undefined,
  })(({ state, setState }) => {
    const onNewScreenChange: (screen: NewScreen) => void = (screen) => {
      setState((prev) => ({
        ...prev,
        title: screen.title,
      }));
    };

    return (
      <Provider store={store}>
        <Wrapper>
          <ScreenListWithInput
            size={size}
            appearAt={appearAt}
            title={state.title}
            onNewScreenChange={onNewScreenChange}
          />
        </Wrapper>
      </Provider>
    );
  }));
});
