import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import PrintTopbar, {
  DispatchProps,
  OwnProps,
  mapDispatchToProps,
} from './';

describe('DispatchProps', () => {
  let dispatch: jest.Mock;
  let dispatchProps: DispatchProps;

  beforeEach(() => {
    dispatch = jest.fn();
    dispatchProps = mapDispatchToProps(dispatch);
  });

  it('should call dispatch when next is called', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.next();
    // Dispatch submit
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should call dispatch when cancel is called', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.cancel();
    // Dispatch cancel and open the sidebar
    expect(dispatch).toHaveBeenCalledTimes(2);
  });
});

describe('Connected PrintTopbar', () => {
  const props: OwnProps = {};
  let store: DDMMockStore;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should not emit an error during rendering', () => {
    expect(() => {
      ReactTesting.render(
        <Provider store={store}>
          <PrintTopbar {...props} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});
