import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import PrintTopbar, { Props } from './';

describe('PrintTopbar', () => {
  const createProps: () => Props = () => ({
    next: jest.fn(),
    cancel: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <PrintTopbar {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should call next when click Next button', () => {
    renderResult.rerender(
      <Provider store={store}>
        <PrintTopbar {...props} />
      </Provider>,
    );

    expect(props.next).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.getByTestId('printingtopbar-next'));
    expect(props.next).toHaveBeenCalledTimes(1);
  });

  it('should call cancel when click Cancel button', () => {
    renderResult.rerender(
      <Provider store={store}>
        <PrintTopbar {...props} />
      </Provider>,
    );

    expect(props.cancel).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.getByTestId('printingtopbar-cancel'));
    expect(props.cancel).toHaveBeenCalledTimes(1);
  });
});
