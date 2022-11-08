import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React, { createRef } from 'react';
import { Provider } from 'react-redux';
import createMockStore, { MockStore, MockStoreCreator } from 'redux-mock-store';

import * as M from '^/store/Mock';
import { Story } from '^/story.types';
import * as T from '^/types';
import { DDMMockStore, createDDMMockStore } from '^/utilities/test-util';
import NotificationPopup, { Props } from '.';

const createProps: () => Props = () => ({
  isNotificationPanelOpened: false,
  setIsNotificationPanelOpened: action('setIsNotificationPanelOpened'),
  parentRef: createRef(),
});

const story: Story = storiesOf('Organisms|NotificationPopup', module);

type MockState = Pick<T.State, 'Pages' | 'Users'>;
const mockStoreCreator: MockStoreCreator<MockState> = createMockStore<MockState>();

const getStore: (lang: T.Language) => MockStore<MockState> = (language) => {
  const mockState: MockState = {
    Pages: {
      ...M.mockPages,
      Common: {
        ...M.mockPages.Common,
        language,
      },
    },
    Users: {
      ...M.mockUsers,
      getNoticeStatus: T.APIStatus.SUCCESS,
    },
  };

  return mockStoreCreator(mockState);
};

Object.values(T.Language).map((language) => {
  const store: MockStore<MockState> = getStore(language);

  story.add(`Empty-${language}`, () => (
    <Provider store={store}>
      <NotificationPopup {...createProps()} isNotificationPanelOpened={true} />
    </Provider>
  ));
});

Object.values(T.Language).map((language) => {
  const store: DDMMockStore = createDDMMockStore(language);

  story.add(`Notifications List-${language}`, () => (
    <Provider store={store}>
      <NotificationPopup {...createProps()} isNotificationPanelOpened={false} />
    </Provider>
  ));
});

Object.values(T.Language).map((language) => {
  const store: MockStore<MockState> = getStore(language);

  story.add(`Alert Popups-${language}`, () => (
    <Provider store={store}>
      <NotificationPopup {...createProps()} isNotificationPanelOpened={false} />
    </Provider>
  ));
});
