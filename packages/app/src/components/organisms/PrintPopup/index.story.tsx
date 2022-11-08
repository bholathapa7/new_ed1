import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreCreator } from 'redux-mock-store';

import * as M from '^/store/Mock';
import * as T from '^/types';
import { makeReduxDecorator } from '^/utilities/storybook-redux.story';
import PrintPopup, { Props } from './';

type MockState = Pick<T.State, 'ProjectConfigPerUser' | 'Pages' | 'Contents'>;
const mockStoreCreator: MockStoreCreator<MockState> = createMockStore<MockState>();
const mockState: MockState = {
  ProjectConfigPerUser: M.mockProjectConfigPerUser,
  Pages: M.mockPages,
  Contents: M.mockContents,
};

storiesOf('Organisms|PrintPopup', module)
  .addDecorator(makeReduxDecorator({
    Pages: M.mockPages,
  }))
  .add('default', () => {
    const props: Props = {
      zIndex: 1000,
    };

    return (
      <Provider store={mockStoreCreator(mockState)}>
        <PrintPopup {...props} />
      </Provider>
    );
  });
