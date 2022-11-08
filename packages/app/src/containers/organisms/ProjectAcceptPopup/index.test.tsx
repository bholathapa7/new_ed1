import * as ReactTesting from '@testing-library/react';
import _ from 'lodash-es';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import * as M from '^/store/Mock';

import ProjectAcceptPopup, {
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

  it('should call dispatch when call onClose', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.onClose();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should call dispatch when call onSubmit', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.onDecide(0);
    // eslint-disable-next-line no-magic-numbers
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe('StateProps', () => {
  type MockState = Pick<T.State, 'Projects' | 'Users'>;
  const state: MockState = {
    Projects: M.mockProjects,
    Users: M.mockUsers,
  };

  describe('all projects should be pending', () => {
    const stateProps: StateProps = mapStateToProps(state);
    stateProps.projects.forEach((data) => {
      expect(data.permissionStatus).toBe(T.AcceptStatus.PENDING);
    });
  });
});

describe('Connected ProjectAcceptPopup', () => {
  const props: OwnProps = {
    zIndex: 23,
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
          <ProjectAcceptPopup {...props} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});
