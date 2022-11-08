import { storiesOf } from '@storybook/react';
import React from 'react';

import { makeReduxDecorator } from '^/utilities/storybook-redux.story';

import * as M from '^/store/Mock';

import PrivatePolicyPage from './';

storiesOf('Pages|PrivatePolicyPage', module)
  .addDecorator(makeReduxDecorator({
    Pages: M.mockPages,
    router: M.mockrouter,
  }))
  .add('default', () => (
    <PrivatePolicyPage />
  ));
