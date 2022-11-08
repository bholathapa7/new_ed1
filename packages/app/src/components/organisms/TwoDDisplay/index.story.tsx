import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import { TwoDDisplay } from './';

import * as T from '^/types';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

storiesOf('Organisms|TwoDDisplay', module)
  .add('default',
    () => {
      const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

      return (
        <Provider store={store}>
          <TwoDDisplay />
        </Provider>
      );
    });
