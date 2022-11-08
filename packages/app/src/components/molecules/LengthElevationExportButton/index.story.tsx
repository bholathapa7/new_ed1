import { storiesOf } from '@storybook/react';
import React from 'react';

import { makeReduxDecorator } from '^/utilities/storybook-redux.story';

import * as M from '^/store/Mock';

import LengthElevationExportButton from './';

storiesOf('Molecules|LengthElevationExportButton', module)
  .addDecorator(makeReduxDecorator({
    Pages: M.mockPages,
    Projects: M.mockProjects,
    Contents: M.mockContents,
  }))
  .add('default', () => (
    <LengthElevationExportButton
      comparisonColors={[]}
      comparisonTitles={[]}
    />
  ));
