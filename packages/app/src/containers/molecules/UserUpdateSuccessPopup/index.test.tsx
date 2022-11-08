import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import UserUpdateSuccessPopup, {
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

  it('should call dispatch when it is closed', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.onClose();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe('Connected UserUpdateSuccessPopup', () => {
  const props: OwnProps = {
    zIndex: 0,
  };
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
          <UserUpdateSuccessPopup {...props} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});
