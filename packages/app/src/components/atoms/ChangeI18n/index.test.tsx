import * as ReactTesting from '@testing-library/react';
import React, { ComponentClass, FC } from 'react';
import { Provider } from 'react-redux';
import createMockStore, { MockStore, MockStoreCreator } from 'redux-mock-store';

import * as T from '^/types';

import { commonAfterEach } from '^/utilities/test-util';

import * as M from '^/store/Mock';
import { ChangeLanguage } from '^/store/duck/Pages/Common';

import changeI18n, { ChangeI18nProps } from './';

describe('changeI18n', () => {
  type MockState = Pick<T.State, 'Pages'>;
  const mockStoreCreator: MockStoreCreator<MockState> = createMockStore<MockState>();
  const mockState: MockState = {
    Pages: {
      ...M.mockPages,
      Common: {
        ...M.mockPages.Common,
        language: T.Language.KO_KR,
      },
    },
  };

  const Inner: FC<ChangeI18nProps> = ({ changeLanguage }) => (
    <button onClick={() => changeLanguage(T.Language.EN_US)} data-testid='inner-button' />
  );
  let store: MockStore<MockState>;
  let Wrapped: ComponentClass;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = mockStoreCreator(mockState);
    Wrapped = changeI18n(Inner);
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <Wrapped />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should be renderable', () => {
    expect(renderResult).toBeTruthy();
  });

  it('should have passed component', () => {
    expect(renderResult.queryAllByTestId('inner-button')).toHaveLength(1);
  });

  it('should dispatch changeLanguage action when button clicked', () => {
    ReactTesting.fireEvent.click(renderResult.getByTestId('inner-button'));

    expect(store.getActions()).toHaveLength(1);
    expect(store.getActions()[0]).toEqual(ChangeLanguage({ language: T.Language.EN_US }));
  });
});
