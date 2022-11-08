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

import ProjectPermissionTable, {
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

  it('should call dispatch when call onPermissionChange', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.onPermissionChange(0, T.PermissionRole.ADMIN, true);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should call dispatch to update the permission confirmation and show popup when onDelete is called', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.onDelete(0, true);
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it('should call dispatch with NoPermissionPopup', () => {
    const noPermissionDispatchParam: {
      popup: T.ProjectPagePopupType;
      type: string;
    } = {
      popup: T.ProjectPagePopupType.NO_PERMISSION,
      type: 'ddm/pages/OPEN_PROJECT_PAGE_POPUP',
    };

    dispatchProps.onDelete(0, false);
    expect(dispatch).toHaveBeenLastCalledWith(noPermissionDispatchParam);

    dispatchProps.onPermissionChange(0, T.PermissionRole.ADMIN, false);
    expect(dispatch).toHaveBeenLastCalledWith(noPermissionDispatchParam);
  });
});

describe('StateProps', () => {
  type MockState = Pick<T.State, 'Auth' | 'Permissions' | 'Projects' | 'Users' | 'Pages'>;
  const mockState: MockState = {
    Auth: M.mockAuth,
    Permissions: M.mockPermissions,
    Projects: M.mockProjects,
    Users: M.mockUsers,
    Pages: {
      ...M.mockPages,
      Project: M.mockProjectPageWithEditing,
    },
  };
  let stateProps: StateProps;

  beforeEach(() => {
    stateProps = mapStateToProps(mockState);
  });

  it('should have invalid project id if there\'s no selected project', () => {
    stateProps = mapStateToProps({
      ...mockState,
      Pages: {
        ...M.mockPages,
        Project: M.mockProjectPage,
      },
    });
    expect(stateProps.permissions.length).toBe(0);
  });
});

describe('Connected ProjectPermissionTable', () => {
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
          <ProjectPermissionTable {...props} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});
