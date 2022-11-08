import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import { sampleFullUser } from '^/store/Mock';

import MypageProfile from './';

storiesOf('Molecules|MypageProfile', module)
  .add('not-edited', () => (
    <MypageProfile
      user={sampleFullUser}
      isAvatarEdited={false}
      onChange={action('onChange')}
    />
  ))
  .add('edited', () => (
    <MypageProfile
      user={sampleFullUser}
      isAvatarEdited={true}
      onChange={action('onChange')}
    />
  ));
