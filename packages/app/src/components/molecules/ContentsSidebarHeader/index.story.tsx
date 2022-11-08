import { storiesOf } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import createMockStore, { MockStoreEnhanced } from 'redux-mock-store';

import * as M from '^/store/Mock';
import * as T from '^/types';
import ContentsSidebarHeader from './';

type MockState = Pick<T.State, 'Projects' | 'ProjectConfigPerUser' | 'Contents' | 'Pages'>;

const store: MockStoreEnhanced<MockState> = createMockStore<MockState>()({
  Projects: M.mockProjects,
  ProjectConfigPerUser: M.mockProjectConfigPerUser,
  Contents: M.mockContents,
  Pages: M.mockPages,
});

storiesOf('Molecules|ContentsSidebarHeader', module)
  .add('default', () => (
    <Provider store={store}>
      <ContentsSidebarHeader />
    </Provider>
  ));
