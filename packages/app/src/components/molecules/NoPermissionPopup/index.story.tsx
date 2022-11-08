import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import NoPermissionPopup, { Props } from './';

storiesOf('Molecules|NoPermissionPopup', module)
  .add('default', () => {
    const props: Props = {
      zIndex: 1000,
      onClose: action('onClose'),
    };

    return (
      <NoPermissionPopup {...props} />
    );
  });
