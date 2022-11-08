import { storiesOf } from '@storybook/react';
import React from 'react';

import { makeReduxDecorator } from '^/utilities/storybook-redux.story';

import * as M from '^/store/Mock';

import SignInForm from './';

storiesOf('Organisms|SignInForm', module)
  .addDecorator(makeReduxDecorator({
    Pages: M.mockPages,
  }))
  .add('default', () => <SignInForm />);
