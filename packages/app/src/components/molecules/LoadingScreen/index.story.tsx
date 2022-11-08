import { storiesOf } from '@storybook/react';
import React from 'react';

import palette from '^/constants/palette';

import LoadingScreen, { Props } from './';

storiesOf('Molecules|LoadingScreen', module)
  .add('default', () => {
    const props: Props = {
      backgroundColor: palette.white,
      textColor: palette.textGray,
    };

    return (
      <LoadingScreen {...props} />
    );
  });
