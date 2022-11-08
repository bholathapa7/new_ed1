import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

import DXF2RasterProcessingFailPopup, { Props } from './';

storiesOf('Molecules|DXF2RasterProcessingFailPopup', module)
  .add('default Korean', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    const props: Props = {
      zIndex: 5,
    };

    return (
      <Provider store={store}>
        <DXF2RasterProcessingFailPopup {...props} />
      </Provider>
    );
  })
  .add('default English', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.EN_US);

    const props: Props = {
      zIndex: 5,
    };

    return (
      <Provider store={store}>
        <DXF2RasterProcessingFailPopup {...props} />
      </Provider>
    );
  });
