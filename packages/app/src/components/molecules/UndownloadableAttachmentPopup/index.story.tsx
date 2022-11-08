import { action } from '@storybook/addon-actions';
import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';

import * as T from '^/types';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { Provider } from 'react-redux';
import UndownloadableAttachmentPopup from './';

const story: StoryApi = storiesOf('Molecules|UndownloadableAttachmentPopup', module);

Object.values(T.Language).map((lang) => {
  const store: DDMMockStore = createDDMMockStore(lang);

  story.add(lang, () => (
    <Provider store={store}>
      <UndownloadableAttachmentPopup
        zIndex={0}
        onClose={action('close')}
      />
    </Provider>
  ));
});
