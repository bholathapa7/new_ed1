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

import PasswordResetPage, {
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

  it('should call dispatch twice when password is reset, one for resetting token, one for resetting form values', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.resetPassword();
    // eslint-disable-next-line no-magic-numbers
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it('should call dispatch when resetting api status', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.resetPatchPasswordStatus();
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

  it('should have values matching with the original values', () => {
    expect(stateProps.patchPasswordError).toBe(state.Users.patchPasswordError);
    expect(stateProps.patchPasswordStatus).toBe(state.Users.patchPasswordStatus);
  });
});

describe('Connected PasswordResetPage', () => {
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
          <PasswordResetPage {...props} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});
