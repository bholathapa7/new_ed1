import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import ProfileImageUploader, { Props } from './';

import * as T from '^/types';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

storiesOf('Organisms|ProfileImageUploader', module)
  .add('default',
    () => {
      const createProps: () => Props = () => ({
        avatar: undefined,
        onUpload: action('onUpload'),
      });
      const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

      return (
        <Provider store={store}>
          <ProfileImageUploader {...createProps()} />
        </Provider>
      );
    });
