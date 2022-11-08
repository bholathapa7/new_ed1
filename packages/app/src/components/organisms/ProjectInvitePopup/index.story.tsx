import { storiesOf } from '@storybook/react';
import React from 'react';

import ProjectInvitePopup, { Props } from './';

const props: Props = {
  zIndex: 0,
};

storiesOf('Organisms|ProjectInvitePopup', module)
  .add('success', () => (
    <ProjectInvitePopup {...props} />
  ))
  .add('progress', () => (
    <ProjectInvitePopup
      {...props}
    />
  ))
  .add('error', () => (
    <ProjectInvitePopup
      {...props}
    />
  ));
