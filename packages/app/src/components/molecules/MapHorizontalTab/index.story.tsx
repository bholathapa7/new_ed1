import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import MapHorizontalTab from './';

import * as T from '^/types';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

storiesOf('Molecules|MapHorizontalTab', module)
  .add('default',
    () => {
      const noop: () => void = () => undefined;
      const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

      return (
        <Provider store={store}>
          <MapHorizontalTab handleUpdateLengthHoverPoint={noop} />
        </Provider>
      );
    });
