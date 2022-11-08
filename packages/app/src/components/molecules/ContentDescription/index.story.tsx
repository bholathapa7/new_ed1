import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import ContentDescription from './';

import * as M from '^/store/Mock';
import * as T from '^/types';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

storiesOf('Molecules|ContentDescription', module)
  .add('default', () => {
    const content: T.MarkerContent = M.sampleContentFromType(T.ContentType.MARKER) as T.MarkerContent;

    return (
      <Provider store={store}>
        <ContentDescription content={content} />
      </Provider>
    );
  });
