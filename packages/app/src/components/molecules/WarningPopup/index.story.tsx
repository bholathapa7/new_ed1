import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { Props, WarningPopup } from '.';

const props: Props = {
  zIndex: 1000,
  type: T.ContentPagePopupType.DELETE_SCREEN,
};

const story: StoryApi = storiesOf('Molecules|WarningPopup', module);

Object.values(T.Language).map((lang) => {
  const store: DDMMockStore = createDDMMockStore(lang);

  story.add(`${lang}|DeleteScreen`, () => (
    <Provider store={store}>
      <WarningPopup {...props} />
    </Provider>
  ));

  story.add(`${lang}|OverwriteScreen`, () => (
    <Provider store={store}>
      <WarningPopup {...props} type={T.ContentPagePopupType.OVERWRITE_SCREEN} />
    </Provider>
  ));
});
