import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import PasswordResetFailureMessage, { Props } from './';

describe('PasswordResetFailureMessage', () => {
  const createProps: () => Props = () => ({
    backToForm: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <PasswordResetFailureMessage {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should call backToForm on retry button click', () => {
    expect(props.backToForm).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.getByTestId('retry-button'));
    expect(props.backToForm).toHaveBeenCalledTimes(1);
  });
});
