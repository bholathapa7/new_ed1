import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import ToggleSlider, { Props } from './';

storiesOf('Atoms|ToggleSlider', module)
  .add('enabled', () => {
    const props: Props = {
      enabled: true,
    };

    return (
      <ToggleSlider {...props} />
    );
  })
  .add('disabled', () => {
    const props: Props = {
      enabled: false,
    };

    return (
      <ToggleSlider {...props} />
    );
  })
  .add('with onClick props', () => {
    const props: Props = {
      enabled: false,
      onClick: action('change'),
    };

    return (
      <ToggleSlider {...props} />
    );
  });
