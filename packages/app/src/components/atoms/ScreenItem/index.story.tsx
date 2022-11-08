import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import styled from 'styled-components';

import { sampleScreen } from '^/store/Mock';
import * as T from '^/types';
import { withState } from '^/utilities/storybook-state.story';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { ScreenItem } from './';

const Wrapper = styled.div({
  width: '237px',
  margin: '50px',
});

const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

const story: StoryApi = storiesOf('Atoms|ScreenItem', module);

const mockScreenId: T.Screen['id'] = sampleScreen().id;

Object.values(T.CalendarScreenSize).map((size) => (
  story.add(size, withState({ isClicked: false })(({
    state,
    setState,
  }) => {
    const onClick: () => void = () => setState((prevState) => ({ ...prevState, isClicked: !prevState.isClicked }));

    return (
      <Provider store={store}>
        <Wrapper>
          <ScreenItem size={size} screenId={mockScreenId} isClicked={state.isClicked} onClick={onClick} />
        </Wrapper>
      </Provider>
    );
  }))
    .add(`${size} not clickable`, () => (
      <Provider store={store}>
        <Wrapper>
          <ScreenItem size={size} screenId={mockScreenId} />
        </Wrapper>
      </Provider>
    ))
));
