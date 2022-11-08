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

import PasswordForm, {
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

  it('should call dispatch when form value is changed', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.onChange({
      email: 'fwef@gfwef.wwev',
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should call dispatch when form is submitted', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.onSubmit({
      email: 'pqcza@zpcqw.qwdmj',
    });
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe('StateProps', () => {
  type MockState = Pick<T.State, 'Users' | 'Pages' | 'PlanConfig'>;
  const state: MockState = {
    Users: M.mockUsers,
    Pages: M.mockPages,
    PlanConfig: M.mockPlanConfig,
  };
  let stateProps: StateProps;

  beforeEach(() => {
    stateProps = mapStateToProps(state);
  });

  it('should have same values with original state', () => {
    expect(stateProps.formValues).toBe(state.Pages.Front.passwordFormValues);
    expect(stateProps.resetPasswordError).toBe(state.Users.postPasswordResetError);
    expect(stateProps.resetPasswordStatus).toBe(state.Users.postPasswordResetStatus);
  });
});

describe('Connected PasswordForm', () => {
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
          <PasswordForm {...props} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});
