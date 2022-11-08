import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import SignUpFailureMessage, { Props } from './';

describe('SignUpFailureMessage', () => {
  const createProps: () => Props = () => ({
    resetSignUpAPI: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <SignUpFailureMessage {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should have a link for reset', () => {
    expect(renderResult.container.getElementsByTagName('a')).toHaveLength(1);
  });

  it('should reset sign up api when clicking its link', () => {
    expect(props.resetSignUpAPI).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.container.getElementsByTagName('a')[0]);
    expect(props.resetSignUpAPI).toHaveBeenCalledTimes(1);
  });
});
