import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

import PointEditTutorialPanel, { Props } from './';

storiesOf('Molecules|PointEditPointEditTutorialPanel', module)
  .add('default with Korean', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    const props: Props = {
      isEditable: true,
      isPointEditTutorialPanelShown: true,
      onClosePointEditTutorialPanel: action('onClosePointEditTutorialPanel'),
    };

    return (
      <Provider store={store}>
        <PointEditTutorialPanel {...props} />
      </Provider>
    );
  })
  .add('default with English', () => {
    const store: DDMMockStore = createDDMMockStore(T.Language.EN_US);

    const props: Props = {
      isEditable: true,
      isPointEditTutorialPanelShown: true,
      onClosePointEditTutorialPanel: action('onClosePointEditTutorialPanel'),
    };

    return (
      <Provider store={store}>
        <PointEditTutorialPanel {...props} />
      </Provider>
    );
  });
