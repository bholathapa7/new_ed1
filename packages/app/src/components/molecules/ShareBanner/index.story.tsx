import { storiesOf } from '@storybook/react';
import React from 'react';

import { makeReduxDecorator } from '^/utilities/storybook-redux.story';
import { initialMockState } from '^/utilities/test-util';
import { ShareBanner } from './';

storiesOf('Molecules|ShareBanner', module)
  .addDecorator(makeReduxDecorator(initialMockState))
  .add('long texts',
    () => <ShareBanner />);

storiesOf('Molecules|ShareBanner', module)
  .addDecorator(makeReduxDecorator({
    ...initialMockState,
    SharedContents: {
      ...initialMockState,
      showAt: new Date(),
      projectName: 'short text project titele',
      screenTitle: 'short textttt title',
    },
  }))
  .add('short texts',
    () => <ShareBanner />,
  );
