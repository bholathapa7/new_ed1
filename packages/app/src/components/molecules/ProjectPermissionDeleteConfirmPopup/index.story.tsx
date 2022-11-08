import { storiesOf } from '@storybook/react';
import React from 'react';

import * as M from '^/store/Mock';

import { makeReduxDecorator } from '^/utilities/storybook-redux.story';
import { initialMockState } from '^/utilities/test-util';
import ProjectPermissionDeleteConfirmPopup, { Props } from '.';

storiesOf('Molecules|ProjectPermissionDeleteConfirmPopup', module)
  .addDecorator(makeReduxDecorator({
    ...initialMockState,
    Permissions: {
      ...initialMockState.Permissions,
      confirmDeletePermission: M.mockPermissions.permissions.byId[M.mockPermissions.permissions.allIds[0]],
    },
  }))
  .add('default', () => {
    const props: Props = {
      zIndex: 100,
    };

    return (
      <ProjectPermissionDeleteConfirmPopup {...props} />
    );
  });
