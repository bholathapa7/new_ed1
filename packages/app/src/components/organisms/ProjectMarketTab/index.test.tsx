import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import ProjectMarketTab from './';

describe('ProjectMarketTab', () => {
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <ProjectMarketTab />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should display dummy text', () => {
    expect(renderResult.queryAllByText(/market/i)).toHaveLength(1);
  });
});
