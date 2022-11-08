import { storiesOf } from '@storybook/react';
import React, { FC, useState } from 'react';
import { Provider } from 'react-redux';
import createMockStore, { MockStore, MockStoreCreator } from 'redux-mock-store';

import { UseState } from '^/hooks';
import * as M from '^/store/Mock';
import { Story } from '^/story.types';
import * as T from '^/types';
import { AttachUploadCoordinateSystem } from '.';

const story: Story = storiesOf('Molecules|AttachUploadCoordinateSystem', module);

type MockState = Pick<T.State, 'Pages' | 'Users' | 'Projects'>;
const mockStoreCreator: MockStoreCreator<MockState> = createMockStore<MockState>();
const mockState: MockState = {
  Projects: {
    ...M.mockProjects,
  },
  Pages: {
    ...M.mockPages,
    Common: {
      ...M.mockPages.Common,
    },
  },
  Users: {
    ...M.mockUsers,
    getNoticeStatus: T.APIStatus.SUCCESS,
  },
};

const store: MockStore<MockState> = mockStoreCreator(mockState);

const Component: FC = () => {
  const [coordinateSystem, setCoordinateSystem]: UseState<T.CoordinateSystem | undefined> = useState<T.CoordinateSystem>();

  return (
    <Provider store={store}>
      <AttachUploadCoordinateSystem
        coordinateSystem={coordinateSystem}
        setCoordinateSystem={setCoordinateSystem}
      />
    </Provider>
  );
};

story.add('default', () => <Component />);
