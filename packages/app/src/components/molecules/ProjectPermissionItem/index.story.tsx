import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import ProjectPermissionItem, { Props } from './';

import { sampleRestrictedUser, sampleSinglePermission } from '^/store/Mock';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

import * as T from '^/types';

storiesOf('Molecules|ProjectPermissionItem', module)
  .add('default', () => {
    const props: Props = {
      user: sampleRestrictedUser,
      permission: sampleSinglePermission,
      zIndex: 0,
      featurePermission:{},
      onDelete: action('onDelete'),
      onPermissionChange: action('onPermissionChange'),
      onFeaturePermissionChange: action('onFeaturePermissionChange'),
    };
    const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

    return (
      <Provider store={store}>
        <ProjectPermissionItem {...props} />
      </Provider>
    );
  });
