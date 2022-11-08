import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import BlueprintAlignPopup, { Props } from './';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

import * as T from '^/types';

storiesOf('Organisms|BlueprintAlignPopup', module)
  .add('default', () => {
    const props: Props = {
      zIndex: 0,
    };
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <BlueprintAlignPopup {...props} />
      </Provider>
    );
  });
