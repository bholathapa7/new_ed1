import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { DDMMockStore, commonAfterEach, createDDMMockStore } from '^/utilities/test-util';

import * as T from '^/types';

import NotificationTopBar from './';

describe('NotoficationTopBar', () => {
  let renderResult: ReactTesting.RenderResult;
  let store: DDMMockStore;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <NotificationTopBar />,
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render correctly', () => {
    expect(renderResult.getByTestId('notification-topbar-root')).toBeTruthy();
  });

  it('after click close, root must has display: none', () => {
    expect(renderResult.getByTestId('notification-topbar-root')).toBeTruthy();
    ReactTesting.fireEvent.click(renderResult.getByTestId('notification-topbar-close'));
    expect(renderResult.getByTestId('notification-topbar-root')).toHaveStyleRule('display', 'none');
  });

  it.skip('after click without auth, nothing happens', () => {
    ReactTesting.fireEvent.click(renderResult.getByTestId('notification-topbar-link'));
    jest.spyOn(window, 'open');
    expect(window.open).toHaveBeenCalledTimes(0);
  });
});
