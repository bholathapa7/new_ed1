import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';

import ProjectPermissionTable, { Props } from './';

import { mockUsers, sampleMultiplePermissions } from '^/store/Mock';

import * as T from '^/types';

import {
  DDMMockStore,
  createDDMMockStore,
} from '^/utilities/test-util';

storiesOf('Organisms|ProjectPermissionTable', module)
  .add('default',
    () => {
      const permissions: Props['permissions'] =
        sampleMultiplePermissions.map<[T.RestrictedUser, T.Permission]>((value) => [
          mockUsers.users.byId[value.userId],
          value,
        ]);
      const createProps: () => Props = () => ({
        authedRole: T.PermissionRole.ADMIN,
        permissions,
        onDelete: action('onDelete'),
        onPermissionChange: action('onPermissionChange'),
        featurePermission: {},
        onFeaturePermissionChange: action('onFeaturePermissionChange'),
      });
      const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

      return (
        <Provider store={store}>
          <ProjectPermissionTable {...createProps()} />
        </Provider>
      );
    });
