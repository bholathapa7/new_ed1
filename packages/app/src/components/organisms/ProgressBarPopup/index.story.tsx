import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import ProgressBarPopup, { Props } from './';

import * as T from '^/types';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

const date: Date = new Date();

const props: () => Props = () => ({
  zIndex: 0.45,
  content: {
    id: 1,
    type: T.AttachmentType.POINTCLOUD,
    file: [{
      hash: 'data.las// 10',
      size: 100,
    }],
    uploadedAt: date,
    status: T.APIStatus.PROGRESS,
  },
  uploadStatus: {
    'data.las// 1': {
      total: 100,
      progress: 50,
    },
  },
  onCancel: action('onCancel'),
  onClose: action('onClose'),
  onComplete: action('onComplete'),
});

const store: DDMMockStore = createDDMMockStore(T.Language.EN_US);

storiesOf('Organisms|ProgressBarPopup', module)
  .add('English', () => (
    <Provider store={store}>
      <ProgressBarPopup {...props()} />
    </Provider>
  ))
  .add('Korean', () => (
    <ProgressBarPopup {...props()} />
  ));
