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

import AccountCard, {
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

  it('should call dispatch once when try to move to my page', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.toMyPage();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe('StateProps', () => {
  type MockState = Pick<T.State, 'Auth' | 'Users'>;
  const mockState: MockState = {
    Auth: M.mockAuth,
    Users: M.mockUsers,
  };
  let stateProps: StateProps;

  it('should have appropriate user if auth token exists', () => {
    stateProps = mapStateToProps(mockState);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(stateProps.authedUser).toBe(M.mockUsers.users.byId[M.mockAuth.authedUser!.id]);
  });

  it('should have undefined authedUser if auth token doesn\'t exist', () => {
    stateProps = mapStateToProps({
      ...mockState,
      Auth: M.mockAuthWithoutToken,
    });
    expect(stateProps.authedUser).toBe(undefined);
  });
});

describe('Connected AccountCard', () => {
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
          <AccountCard {...props} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});
