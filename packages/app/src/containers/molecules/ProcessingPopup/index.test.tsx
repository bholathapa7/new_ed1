import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import ProcessingPopup, {
  DispatchProps,
  OwnProps,
  mapDispatchToProps,
} from './';

describe('DispatchProps', () => {
  let dispatch: jest.Mock;
  let dispatchProps: DispatchProps;

  beforeEach(() => {
    dispatch = jest.fn();
  });

  it('should call dispatch when call onClose', () => {
    dispatchProps = mapDispatchToProps(dispatch);
    dispatchProps.onClose();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe('Connected ProcessingPopup', () => {
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
          <ProcessingPopup {...props} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});
