import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import ContentImagePopup, { Props } from './';

import { sampleMultipleAttachments } from '^/store/Mock';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

import * as T from '^/types';

storiesOf('Molecules|ContentImagePopup', module)
  .add('default', () => {
    const props: Props = {
      zIndex: 1,
      timezoneOffset: 0,
      attachments: sampleMultipleAttachments,
      selected: sampleMultipleAttachments[0],
      onClick: action('onclick'),
      onClose: action('onclose'),
      editingId: undefined,
      onDelete: action('onDelete'),
      onNoPermission: action('onNoPermission'),
      sidebarTab: T.ContentPageTabType.MEASUREMENT,
    };
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <ContentImagePopup {...props} />
      </Provider>
    );
  });
