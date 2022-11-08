import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';
import { SignUpTutorialPopup } from '.';

const zIndex: number = 300;

const story: StoryApi = storiesOf('Molecules|SignUpTutorialPopup', module);

Object.values(T.Language).forEach((language) => story.add(language, () => {
  const store: DDMMockStore = createDDMMockStore(language);

  return (
    <Provider store={store}>
      <SignUpTutorialPopup zIndex={zIndex} />
    </Provider>
  );
}));
