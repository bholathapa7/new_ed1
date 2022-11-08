import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import ProjectSidebar from './';

import * as T from '^/types';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

storiesOf('Organisms|ProjectSidebar', module)
  .add('default',
    () => {
      const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

      return (
        <Provider store={store}>
          <ProjectSidebar />
        </Provider>
      );
    });
