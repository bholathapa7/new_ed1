import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';
import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';
import ContentUploadPopup, { Props } from './';

const story: StoryApi = storiesOf('Organisms|ContentUploadPopup', module);

const createProps: () => Props = () => ({
  zIndex: 300,
});

Object.values(T.Language).forEach((lang) => {
  const store: DDMMockStore = createDDMMockStore(lang);

  story.add(lang, () => (
    <Provider store={store}>
      <ContentUploadPopup {...createProps()} />
    </Provider>
  ));
});
