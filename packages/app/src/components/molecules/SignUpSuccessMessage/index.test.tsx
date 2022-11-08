import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import SignUpSuccessMessage, { Props } from './';

describe('SignUpSuccessMessage', () => {
  const createProps: () => Props = () => ({
    onLogin: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <SignUpSuccessMessage {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should have button for login', () => {
    expect(renderResult.container.getElementsByTagName('button')).toHaveLength(1);
  });

  it('should call login callback when login button is clicked', () => {
    expect(props.onLogin).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.container.getElementsByTagName('button')[0]);
    expect(props.onLogin).toHaveBeenCalledTimes(1);
  });
});
