import { storiesOf } from '@storybook/react';
import React from 'react';

import Guagebar, { Props } from './';

storiesOf('Atoms|Guagebar', module)
  .add('full', () => {
    const props: Props = {
      ratio: 1,
    };

    return (
      <Guagebar {...props} />
    );
  })
  .add('half', () => {
    const props: Props = {
      ratio: 0.5,
    };

    return (
      <Guagebar {...props} />
    );
  });
