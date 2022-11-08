import { storiesOf } from '@storybook/react';
import React from 'react';

import RainbowHistogram, { Props } from './';

storiesOf('Atoms|RainbowHistogram', module)
  .add('default', () => {
    const props: Props = {
      // eslint-disable-next-line no-magic-numbers
      data: [30, 15, -20, -30, 62, 20],
      percents: {
        min: 0,
        max: 1,
      },
    };

    return (
      <RainbowHistogram {...props} />
    );
  });
