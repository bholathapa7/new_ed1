import { storiesOf } from '@storybook/react';
import React from 'react';

import ProjectAddPopup, { Props } from './';

const props: Props = {
  zIndex: 0,
};

storiesOf('Organisms|ProjectAddPopup', module)
  .add('success', () => (
    <ProjectAddPopup {...props} />
  ))
  .add('progress', () => (
    <ProjectAddPopup
      {...props}
    />
  ));
