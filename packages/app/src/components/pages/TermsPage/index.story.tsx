import { storiesOf } from '@storybook/react';
import React from 'react';

import { makeReduxDecorator } from '^/utilities/storybook-redux.story';

import * as M from '^/store/Mock';

import TermsPage from './';

storiesOf('Pages|TermsPage', module)
  .addDecorator(makeReduxDecorator({
    Pages: M.mockPages,
    router: M.mockrouter,
  }))
  .add('default', () => (
    <TermsPage />
  ));

