import { storiesOf } from '@storybook/react';
import React from 'react';

import { makeReduxDecorator } from '^/utilities/storybook-redux.story';

import * as M from '^/store/Mock';

import ContentsSidebar from './';

storiesOf('Organisms|ContentsSidebar', module)
  .addDecorator(makeReduxDecorator({
    Contents: M.mockContents,
    Projects: M.mockProjects,
    Pages: M.mockPages,
  }))
  .add('default', () => (
    <ContentsSidebar />
  ));
