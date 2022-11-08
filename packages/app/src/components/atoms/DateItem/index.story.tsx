import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';
import { withState } from '^/utilities/storybook-state.story';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { DateItem } from './';

const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

const story: StoryApi = storiesOf('Atoms|DateItem', module);

const date: Date = new Date();

Object.values(T.CalendarScreenSize).map((size) => (
  story.add(size, withState({ isClicked: false })(({
    state,
    setState,
  }) => {
    const onClick: () => void = () => setState((prevState) => ({ ...prevState, isClicked: !prevState.isClicked }));

    return (
      <Provider store={store}>
        <DateItem size={size} date={date} isClicked={state.isClicked} onClick={onClick} />
      </Provider>
    );
  }))
    .add(`${size} not clickable`, () => (
      <Provider store={store}>
        <DateItem size={size} date={date} />
      </Provider>
    ))
));
