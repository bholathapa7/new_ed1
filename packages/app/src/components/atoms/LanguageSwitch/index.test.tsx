import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createMockStore, { MockStore, MockStoreCreator } from 'redux-mock-store';

import * as T from '^/types';

import { commonAfterEach } from '^/utilities/test-util';

import * as M from '^/store/Mock';
import { ChangeLanguage } from '^/store/duck/Pages/Common';

import LanguageSwitch, { Props } from './';

describe('LanguageSwitch', () => {
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
  const createProps: () => Props = () => ({
    target: [T.Language.KO_KR, T.Language.EN_US],
  });
  let store: MockStore<MockState>;
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = mockStoreCreator(mockState);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <LanguageSwitch {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should send change language action on switch click', () => {
    ReactTesting.fireEvent.click(renderResult.getByText('KOR'));
    expect(store.getActions()).toHaveLength(1);
    expect(store.getActions()[0]).toEqual(ChangeLanguage({
      language: T.Language.KO_KR,
    }));

    store.clearActions();

    ReactTesting.fireEvent.click(renderResult.getByText('ENG'));
    expect(store.getActions()).toHaveLength(1);
    expect(store.getActions()[0]).toEqual(ChangeLanguage({
      language: T.Language.EN_US,
    }));
  });
});
