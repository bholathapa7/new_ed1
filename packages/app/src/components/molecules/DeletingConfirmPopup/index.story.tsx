import { storiesOf } from '@storybook/react';
import React from 'react';

import * as M from '^/store/Mock';

import { makeReduxDecorator } from '^/utilities/storybook-redux.story';
import { initialMockState } from '^/utilities/test-util';
import DeletingConfirmPopup, { Props } from '.';

storiesOf('Molecules|DeletingConfirmPopup', module)
  .addDecorator(makeReduxDecorator({
    ...initialMockState,
    Pages: {
      ...initialMockState.Pages,
      Contents: {
        ...initialMockState.Pages.Contents,
        deletingContentId: M.mockContents.contents.allIds[0],
      },
    },
  }))
  .add('default', () => {
    const props: Props = {
      zIndex: 100,
    };

    return (
      <DeletingConfirmPopup {...props} />
    );
  });
