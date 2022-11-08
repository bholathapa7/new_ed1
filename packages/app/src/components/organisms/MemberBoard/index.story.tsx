import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import MemberBoard, { Props } from './';

import * as T from '^/types';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

storiesOf('Organisms|MemberBoard', module)
  .add('default',
    () => {
      const createProps: () => Props = () => ({
        handleDeleteClick: action('handleDeleteClick'),
        handleShareClick: action('handleShareClick'),
      });
      const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

      return (
        <Provider store={store}>
          <MemberBoard {...createProps()} />
        </Provider>
      );
    });
