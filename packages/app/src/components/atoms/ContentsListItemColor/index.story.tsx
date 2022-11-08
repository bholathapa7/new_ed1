import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import ContentsListItemColor from './';

import * as M from '^/store/Mock';
import * as T from '^/types';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

storiesOf('Atom|ContentsListItemColor', module).add('default', () => {
  const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

  return (
    <Provider store={store}>
      <ContentsListItemColor content={M.sampleContentFromType(T.ContentType.LENGTH)} />
    </Provider>
  );
});
