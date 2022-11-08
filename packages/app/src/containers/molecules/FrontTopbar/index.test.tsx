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

import FrontTopbar, {
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

  it('should call dispatch when call toLoginPage', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.toLoginPage();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should call dispatch when call toSignUpPage', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.toSignUpPage();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe('StateProps', () => {
  type MockState = Pick<T.State, 'router'>;
  const mockState: MockState = {
    router: M.mockrouter,
  };
  let stateProps: StateProps;

  it('should have true isLoginPage when it is on login page', () => {
    stateProps = mapStateToProps({
      ...mockState,
      router: {
        ...mockState.router,
        location: {
          ...mockState.router.location,
          pathname: '/login',
        },
      },
    });

    expect(stateProps.isLoginPage).toBe(true);
    expect(stateProps.isSignUpPage).toBe(false);
    expect(stateProps.isPasswordPage).toBe(false);

    stateProps = mapStateToProps({
      ...mockState,
      router: {
        ...mockState.router,
        location: {
          ...mockState.router.location,
          pathname: '/',
        },
      },
    });

    expect(stateProps.isLoginPage).toBe(true);
    expect(stateProps.isSignUpPage).toBe(false);
    expect(stateProps.isPasswordPage).toBe(false);
  });

  it('should have true isSignUpPage when it is on signup page', () => {
    stateProps = mapStateToProps({
      ...mockState,
      router: {
        ...mockState.router,
        location: {
          ...mockState.router.location,
          pathname: '/signup',
        },
      },
    });

    expect(stateProps.isLoginPage).toBe(false);
    expect(stateProps.isSignUpPage).toBe(true);
    expect(stateProps.isPasswordPage).toBe(false);
  });

  it('should have true isPasswordPage when it is on password reset pages', () => {
    stateProps = mapStateToProps({
      ...mockState,
      router: {
        ...mockState.router,
        location: {
          ...mockState.router.location,
          pathname: '/reset_password/abdef',
        },
      },
    });

    expect(stateProps.isLoginPage).toBe(false);
    expect(stateProps.isSignUpPage).toBe(false);
    expect(stateProps.isPasswordPage).toBe(true);
  });

  it('should have true isPasswordPage when it is on password main page', () => {
    stateProps = mapStateToProps({
      ...mockState,
      router: {
        ...mockState.router,
        location: {
          ...mockState.router.location,
          pathname: '/password',
        },
      },
    });

    expect(stateProps.isLoginPage).toBe(false);
    expect(stateProps.isSignUpPage).toBe(false);
    expect(stateProps.isPasswordPage).toBe(true);
  });
});

describe('Connected FrontTopbar', () => {
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
          <FrontTopbar {...props} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});
