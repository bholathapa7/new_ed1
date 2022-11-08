import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import ContentTextColorPalette from './';

import * as M from '^/store/Mock';
import * as T from '^/types';
import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

const content: T.ESSTextContent = M.sampleContentFromType(T.ContentType.ESS_TEXT) as T.ESSTextContent;

storiesOf('Atoms|ContentsListESSTextItem ', module)
  .add('default', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.EN_US);

    return (
      <Provider store={store}>
        <ContentTextColorPalette content={content} />
      </Provider>
    );
  });
