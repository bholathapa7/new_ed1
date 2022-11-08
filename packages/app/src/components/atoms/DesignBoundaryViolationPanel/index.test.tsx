import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import * as T from '^/types';

import DesignBoundaryViolationPanel from './';

describe('DesignBoundaryViolationPanel', () => {
  let renderResult: ReactTesting.RenderResult;
  const store: DDMMockStore = createDDMMockStore(T.Language.KO_KR);

  beforeEach(() => {
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <DesignBoundaryViolationPanel />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render panel properly', () => {
    expect(renderResult.getByTestId('design-boundary-violation-panel')).toBeDefined();
  });
});
