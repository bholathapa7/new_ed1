import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

import * as T from '^/types';

import DesignBoundaryViolationPanel from './';

storiesOf('Atoms|DesignBoundaryViolationPanel', module)
  .add('KO_KR', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <DesignBoundaryViolationPanel />
      </Provider>
    );
  })
  .add('EN_US', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.EN_US);

    return (
      <Provider store={store}>
        <DesignBoundaryViolationPanel />
      </Provider>
    );
  });
