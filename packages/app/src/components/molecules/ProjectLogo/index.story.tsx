import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import ProjectLogo from './';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

import * as T from '^/types';

storiesOf('Molecules|ProjectLogo', module)
  .add('default', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <ProjectLogo />
      </Provider>
    );
  });
