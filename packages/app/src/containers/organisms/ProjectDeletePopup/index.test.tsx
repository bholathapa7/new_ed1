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

import ProjectDeletePopup, {
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
    dispatchProps.onSubmit(0, '');
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should call dispatch when call onSuccess', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.onSuccess();
    // eslint-disable-next-line no-magic-numbers
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it('should call dispatch when call resetAPIStatus', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.resetAPIStatus();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

/**
 * @todo Add meaningful tests
 */
describe('StateProps', () => {
  type MockState = Pick<T.State, 'Projects' | 'Pages'>;
  const mockState: MockState = {
    Projects: M.mockProjects,
    Pages: {
      ...M.mockPages,
      Project: M.mockProjectPageWithEditing,
    },
  };
  let stateProps: StateProps;

  beforeEach(() => {
    stateProps = mapStateToProps(mockState);
  });

  it('should have the same delete status that original state have', () => {
    expect(stateProps.deleteStatus).toEqual(mockState.Projects.deleteProjectStatus);
  });
});

describe('Connected ProjectDeletePopup', () => {
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
          <ProjectDeletePopup {...props} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});
