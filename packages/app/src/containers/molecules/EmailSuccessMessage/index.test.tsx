import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import * as M from '^/store/Mock';

import EmailSuccessMessage, {
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

  it('should empty', () => {
    expect(dispatchProps).toEqual({});
  });
});

describe('StateProps', () => {
  type MockState = Pick<T.State, 'Pages' | 'PlanConfig'>;
  const state: MockState = {
    Pages: M.mockPages,
    PlanConfig: M.mockPlanConfig,
  };
  let stateProps: StateProps;

  beforeEach(() => {
    stateProps = mapStateToProps(state);
  });

  it('should have same value with original state', () => {
    expect(stateProps.formValues).toBe(state.Pages.Front.passwordFormValues);
  });
});

describe('Connected EmailSuccessMessage', () => {
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
          <MemoryRouter>
            <EmailSuccessMessage {...props} />
          </MemoryRouter>
        </Provider>,
      );
    }).not.toThrowError();
  });
});
