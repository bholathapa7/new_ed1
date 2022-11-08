import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import { CancelVolumeCreationPopup, Props } from './';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

import * as T from '^/types';

const story: StoryApi = storiesOf('Organisms|CancelVolumeCreationPopup', module);

const props: Props = {
  zIndex: 0,
};

Object.values(T.Language).map((lang) => {
  const store: DDMMockStore = createDDMMockStore(lang);

  story.add(lang, () => (
    <Provider store={store}>
      <CancelVolumeCreationPopup {...props} />
    </Provider>
  ));
});
