import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import { CloseContentPagePopup } from '^/store/duck/Pages';

import NoSelectedMapPopup, {
  DispatchProps,
  OwnProps,
  mapDispatchToProps,
} from './';

/**
 * @todo Add meaningful tests
 */
describe('DispatchProps', () => {
  let dispatch: jest.Mock;
  let dispatchProps: DispatchProps;

  beforeEach(() => {
    dispatch = jest.fn();
    dispatchProps = mapDispatchToProps(dispatch);
  });

  it('should dispatch an action for close popups of content page on close call', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.onClose();
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenLastCalledWith(CloseContentPagePopup());
  });
});

describe('Connected NoSelectedMapPopup', () => {
  const createOwnProps: () => OwnProps = () => ({
    zIndex: 1000,
  });
  let ownProps: OwnProps;
  let store: DDMMockStore;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    ownProps = createOwnProps();
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should not emit an error during rendering', () => {
    expect(() => {
      ReactTesting.render(
        <Provider store={store}>
          <NoSelectedMapPopup {...ownProps} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});
