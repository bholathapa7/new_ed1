import { action } from '@storybook/addon-actions';
import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import SourceErrorPopup, { Props } from './';

const props: Props = {
  zIndex: 1000,
  onClose: action('onClose'),
};

const story: StoryApi = storiesOf('Molecules|SourceErrorPopup', module);

Object.values(T.Language).map((lang) => {
  const store: DDMMockStore = createDDMMockStore(lang);

  story.add(lang, () => (
    <Provider store={store}>
      <SourceErrorPopup {...props} />
    </Provider>
  ));
});
