import * as ReactTesting from '@testing-library/react';
import React, { createRef } from 'react';
import { Provider } from 'react-redux';
import createMockStore, { MockStore, MockStoreCreator } from 'redux-mock-store';

import * as M from '^/store/Mock';
import * as T from '^/types';

import { commonAfterEach } from '^/utilities/test-util';

import NoticePopup, { Props } from './index';

describe('NoticePopup', () => {
  type MockState = Pick<T.State, 'Pages' | 'Users' | 'PlanConfig'>;
  const mockStoreCreator: MockStoreCreator<MockState> = createMockStore<MockState>();
  const mockState: MockState = {
    Pages: {
      ...M.mockPages,
      Common: {
        ...M.mockPages.Common,
        language: T.Language.KO_KR,
      },
    },
    Users: {
      ...M.mockUsers,
      getNoticeStatus: T.APIStatus.SUCCESS,
    },
    PlanConfig: M.mockPlanConfig,
  };

  const createProps: () => Props = () => ({
    parentRef: createRef(),
    isNotificationPanelOpened: true,
    setIsNotificationPanelOpened: jest.fn(),
  });
  let store: MockStore<MockState>;
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = mockStoreCreator(mockState);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <NoticePopup {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  const getNotificationItems: () => Array<HTMLElement> = () => renderResult.queryAllByTestId('notice-notification-item');
  const getNoNoticePopup: () => HTMLElement | null = () => renderResult.queryByTestId('no-notice-popup');

  it('should do nothing if api is not SUCCESS', () => {
    store = mockStoreCreator({
      ...mockState,
      Users: {
        ...mockState.Users,
        getNoticeStatus: T.APIStatus.PROGRESS,
      },
    });

    renderResult.rerender(
      <Provider store={store}>
        <NoticePopup {...props} isNotificationPanelOpened={true} />
      </Provider>,
    );

    expect(getNoNoticePopup()).toBe(null);
    expect(getNotificationItems().length).toBe(0);
  });

  it('should show unshown notifications', () => {
    expect(renderResult.asFragment()).toMatchSnapshot();

    store = mockStoreCreator({
      ...mockState,
      Users: {
        ...mockState.Users,
        notices: Object.values(mockState.Users.notices).map((notice: T.Notice) => ({
          ...notice, isShown: false,
        })),
      },
    });

    renderResult.rerender(
      <Provider store={store}>
        <NoticePopup {...props} />
      </Provider>,
    );

    expect(getNotificationItems().length).toBe(0);
  });

  it('should show unread notices', () => {
    renderResult.rerender(
      <Provider store={store}>
        <NoticePopup {...props} isNotificationPanelOpened={true} />
      </Provider>,
    );

    expect(renderResult.asFragment()).toMatchSnapshot();
  });
});
