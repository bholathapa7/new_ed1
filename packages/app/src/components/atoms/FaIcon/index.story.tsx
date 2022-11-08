import { storiesOf } from '@storybook/react';
import React from 'react';

import FaIcon, { Props } from './';

storiesOf('Atoms|FaIcon', module)
  .add('exclamation-triangle', () => {
    const props: Props = {
      faNames: 'exclamation-triangle', /* ['exclamation-triangle', 'data'], */
      fontSize: '10pt',
      color: 'white',
    };

    return (
      <FaIcon {...props} />
    );
  }).add('multi faNames', () => {
    const props: Props = {
      faNames: ['exclamation-triangle', 'data'],
      fontSize: '10pt',
      color: 'white',
    };

    return (
      <FaIcon {...props} />
    );
  });
