import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';

import * as T from '^/types';
import { withState } from '^/utilities/storybook-state.story';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { Props, ScreenList } from './';

const Wrapper = styled.div({
  width: '267px',
  padding: '20px',

  backgroundColor: '#ffffff',
});

const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

const mockAppearAt: Date = new Date();

interface State {
  clickedScreenId?: T.Screen['id'];
}

const story: StoryApi = storiesOf('Atoms|ScreenList', module);

Object.values(T.CalendarScreenSize).map((size) => (
  story.add(size, withState<State>({
    clickedScreenId: undefined,
  })(({
    state, setState,
  }) => {
    const handleScreenClick: Props['onScreenClick'] = (screen: T.Screen) => {
      setState((prevState) => ({
        ...prevState,
        clickedScreenId: screen.id,
      }));
    };

    return (
      <Provider store={store}>
        <Wrapper>
          <ScreenList
            size={size}
            appearAt={mockAppearAt}
            clickedScreenId={state.clickedScreenId}
            onScreenClick={handleScreenClick}
          />
        </Wrapper>
      </Provider>
    );
  }))
    .add(`${size} not clickable`, () => (
      <Provider store={store}>
        <Wrapper>
          <ScreenList
            size={size}
            appearAt={mockAppearAt}
          />
        </Wrapper>
      </Provider>
    ))
));
