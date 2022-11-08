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

import EmailSuccessMessage, { Props } from './';

describe('EmailSuccessMessage', () => {
  const createProps: () => Props = () => ({
    formValues: {
      email: 'random@test.email',
    },
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <MemoryRouter>
          <EmailSuccessMessage {...props} />
        </MemoryRouter>
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should display an user email', () => {
    expect(renderResult.queryAllByText(/random@test\.email/)).toHaveLength(1);
  });

  it('should display an support email', () => {
    expect(renderResult.queryAllByText(/support@angelswing\.io/)).toHaveLength(1);
  });
});
