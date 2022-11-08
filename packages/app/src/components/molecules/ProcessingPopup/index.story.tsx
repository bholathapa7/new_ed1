import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import * as T from '^/types';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import { Provider } from 'react-redux';
import ProcessingPopup, { Props } from './';

const props: Props = {
  zIndex: 1000,
  onClose: action('onClose'),
};

const store: DDMMockStore = createDDMMockStore(T.Language.EN_US);

storiesOf('Molecules|ProcessingPopup', module)
  .add('Korean', () => <ProcessingPopup {...props} />)
  .add('English', () => (
    <Provider store={store}>
      <ProcessingPopup {...props} />
    </Provider>
  ));
