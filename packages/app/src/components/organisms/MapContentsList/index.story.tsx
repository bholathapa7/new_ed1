import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';
import MapContentsList from '.';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

storiesOf('Organisms|ContentsList', module)
  .add('default', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <MapContentsList />
      </Provider>
    );
  });
