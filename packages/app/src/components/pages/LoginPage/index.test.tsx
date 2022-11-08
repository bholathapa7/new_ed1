import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import LoginPage from './';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
jest.mock('./text', () => require('^/utilities/make-es-module').default({
  default: new Proxy({}, {
    get: () => new Proxy({}, {
      get: () => 'test text',
    }),
  }),
}));
/* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */


describe('LoginPage', () => {
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should display title for login page', () => {
    expect(renderResult.queryByText('test text')).toBeTruthy();
  });
});
