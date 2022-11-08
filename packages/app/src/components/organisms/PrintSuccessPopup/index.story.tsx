import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreCreator } from 'redux-mock-store';

import * as M from '^/store/Mock';
import * as T from '^/types';
import PrintSuccessPopup, { Props } from './';

type MockState = Pick<T.State, 'Auth' | 'Users' | 'Pages'>;
const mockStoreCreator: MockStoreCreator<MockState> = createMockStore<MockState>();
const mockState: MockState = {
  Auth: M.mockAuth,
  Users: M.mockUsers,
  Pages: M.mockPages,
};

storiesOf('Molecules|PrintSuccessPopup', module)
  .add('default', () => {
    const props: Props = {
      zIndex: 1000,
    };

    return (
      <Provider store={mockStoreCreator(mockState)}>
        <PrintSuccessPopup {...props} />
      </Provider>
    );
  });
