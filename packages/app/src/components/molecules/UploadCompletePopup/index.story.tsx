import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import UploadCompletePopup, { Props } from './';

import { Story } from '^/story.types';
import * as T from '^/types';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';

const props: Props = {
  success: true,
  contentId: 1,
  zIndex: 1000,
  onClose: action('onClose'),
};

const store: DDMMockStore = createDDMMockStore(T.Language.EN_US);

const story: Story = storiesOf('Molecules|UploadCompletePopup', module);

Object.values(T.AttachmentType).map((type: T.AttachmentType) => {
  if (type !== T.AttachmentType.PHOTO) {
    story.add(`Korean-${type}`, () =>
      <UploadCompletePopup {...props} />,
    );
    story.add(`English-${type}`, () => (
      <Provider store={store}>
        <UploadCompletePopup {...props} />
      </Provider>
    ));
  }
});

story
  .add('Korean-error', () => <UploadCompletePopup {...props} success={false} />)
  .add('English-error', () => (
    <Provider store={store}>
      <UploadCompletePopup {...props} success={false} />
    </Provider>
  ));
