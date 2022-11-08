import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';
import OverlayContentsList from '.';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

storiesOf('Organisms|OverlayContentsList', module)
  .add('default', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <OverlayContentsList />
      </Provider>
    );
  });
