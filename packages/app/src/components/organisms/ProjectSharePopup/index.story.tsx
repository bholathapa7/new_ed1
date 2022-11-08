import { storiesOf } from '@storybook/react';
import React from 'react';

import ProjectSharePopup, { Props } from './';

const props: Props = {
  zIndex: 0,
};

storiesOf('Organisms|ProjectSharePopup', module)
  .add('success', () => (
    <ProjectSharePopup {...props} />
  ))
  .add('progress', () => (
    <ProjectSharePopup
      {...props}
    />
  ))
  .add('error', () => (
    <ProjectSharePopup
      {...props}
    />
  ));
