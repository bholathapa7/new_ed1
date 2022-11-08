/* eslint-disable no-magic-numbers */
import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import BlueprintTopbar, {
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

  it('should call dispatch when closePopup is called', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.closePopup();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should call dispatch when submit is called', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.submit();
    // Dispatch submit and open the sidebar
    expect(dispatch).toHaveBeenCalledTimes(3);
  });

  it('should call dispatch when cancel is called', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.cancel();
    // Dispatch submit and open the sidebar
    expect(dispatch).toHaveBeenCalledTimes(3);
  });
});

describe('Connected BlueprintTopbar', () => {
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
          <BlueprintTopbar {...props} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});
