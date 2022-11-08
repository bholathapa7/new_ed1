import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import UserUpdateSuccessPopup from './';

storiesOf('Molecules|UserUpdateSuccessPopup', module)
  .add('default', () => (
    <UserUpdateSuccessPopup
      zIndex={0}
      onClose={action('close')}
    />
  ));
