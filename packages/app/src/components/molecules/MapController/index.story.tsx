import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

import MapController from '.';

storiesOf('Organisms|MapController', module)
  .add('Korean', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <MapController />
      </Provider>
    );
  }).add('English', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.EN_US);

    return (
      <Provider store={store}>
        <MapController />
      </Provider>
    );
  });
