import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import NoSelectedMapPopup, { Props } from './';

storiesOf('Molecules|NoSelectedMapPopup', module)
  .add('default', () => {
    const props: Props = {
      zIndex: 1000,
      onClose: action('onClose'),
    };

    return (
      <NoSelectedMapPopup {...props} />
    );
  });
