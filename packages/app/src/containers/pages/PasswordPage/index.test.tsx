import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import * as M from '^/store/Mock';

import PasswordPage, {
  DispatchProps,
  OwnProps,
  StateProps,
  mapDispatchToProps,
  mapStateToProps,
} from './';

describe('DispatchProps', () => {
  let dispatch: jest.Mock;
  let dispatchProps: DispatchProps;

  beforeEach(() => {
    dispatch = jest.fn();
    dispatchProps = mapDispatchToProps(dispatch);
  });

  it('should call dispatch when resetting email is requested', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.resetEmail();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should call dispatch when resetting api status is requested', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.resetPasswordResetStatus();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe('StateProps', () => {
  type MockState = Pick<T.State, 'Users' | 'PlanConfig'>;
  const state: MockState = {
    Users: M.mockUsers,
    PlanConfig: M.mockPlanConfig,
  };
  let stateProps: StateProps;

  beforeEach(() => {
    stateProps = mapStateToProps(state);
  });

  it('should have same values with its original state', () => {
    expect(stateProps.passwordResetStatus).toBe(state.Users.postPasswordResetStatus);
    expect(stateProps.passwordResetError).toBe(state.Users.postPasswordResetError);
  });
});

describe('Connected PasswordPage', () => {
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
          <PasswordPage {...props} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});
