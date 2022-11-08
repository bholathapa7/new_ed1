import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as M from '^/store/Mock';
import { makeAuthHeader } from '^/store/duck/API';
import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import ProjectTopbar, {
  DispatchProps,
  OwnProps,
  StateProps,
  mapDispatchToProps,
  mapStateToProps,
} from './';

describe('StateProps', () => {
  type MockState = Pick<T.State, 'Auth' | 'PlanConfig'>;
  const mockState: MockState = {
    Auth: M.mockAuth,
    PlanConfig: M.mockPlanConfig,
  };
  let stateProps: StateProps;

  it('should have appropriate user if auth token exists', () => {
    stateProps = mapStateToProps(mockState);
    expect(stateProps.authHeader).toEqual(makeAuthHeader(mockState.Auth, ''));
  });
});

describe('DispatchProps', () => {
  let dispatch: jest.Mock;
  let dispatchProps: DispatchProps;

  beforeEach(() => {
    dispatch = jest.fn();
    dispatchProps = mapDispatchToProps(dispatch);
  });

  it('should call dispatch when call signout', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.signout();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should call dispatch when call openMypage', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.openMypage();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should call dispatch when call openListTab', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.openListTab();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe('Connected ProjectTopbar', () => {
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
          <ProjectTopbar {...props} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});
