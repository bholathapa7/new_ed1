import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import ConfirmUserUpdatePopup, { Props } from './';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

import * as T from '^/types';

storiesOf('Organisms|ConfirmUserUpdatePopup', module)
  .add('default', () => {
    const props: Props = {
      zIndex: 0,
    };
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <ConfirmUserUpdatePopup {...props} />
      </Provider>
    );
  });
