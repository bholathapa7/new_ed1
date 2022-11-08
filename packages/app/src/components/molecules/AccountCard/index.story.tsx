import { storiesOf } from '@storybook/react';
import React from 'react';

import AccountCard, { Props } from './';

import { sampleFullUser } from '^/store/Mock';

storiesOf('Molecules|AccountCard', module)
  .add('default', () => {
    const props: Props = {
      toMyPage: () => undefined,
      authedUser: sampleFullUser,
    };

    return (
      <AccountCard {...props} />
    );
  });
