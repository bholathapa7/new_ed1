import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import NotificationTopbar from '.';

const story: StoryApi = storiesOf('Atoms|NotificationTopbar', module);

Object.values(T.Language).forEach((lang) => story.add(lang, () => {
  const store: DDMMockStore = createDDMMockStore(lang);

  return (
    <Provider store={store}>
      <NotificationTopbar />
    </Provider>
  );
}));
