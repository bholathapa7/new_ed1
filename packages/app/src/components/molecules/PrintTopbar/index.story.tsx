import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import PrintTopBar, { Props } from './';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

import * as T from '^/types';

storiesOf('Molecules|PrintTopBar', module)
  .add('default', () => {
    const props: Props = {
      next: action('next'),
      cancel: action('cancel'),
    };
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <PrintTopBar {...props} />
      </Provider>
    );
  });
