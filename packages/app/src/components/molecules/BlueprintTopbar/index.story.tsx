import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import BlueprintTopbar, { Props } from './';

storiesOf('Molecules|BlueprintTopBar', module)
  .add('default', () => {
    const props: Props = {
      closePopup: action('closePopup'),
      submit: action('submit'),
      cancel: action('cancel'),
    };

    return (
      <BlueprintTopbar {...props} />
    );
  }).add('defaultImageEdit', () => {
    const props: Props = {
      closePopup: action('closePopup'),
      submit: action('submit'),
      cancel: action('cancel'),
    };

    return (
      <BlueprintTopbar {...props} />
    );
  });
