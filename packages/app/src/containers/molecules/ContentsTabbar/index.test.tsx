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

import ContentsTabbar, {
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

  it('should call dispatch when call onTabChange', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.onTabClick(T.ContentPageTabType.MAP);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should call dispatch when call onAddClick', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.onUploadClick(T.PermissionRole.ADMIN);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should call dispatch when call onBackClick', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.onLogoClick();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should show correct popup if permission is viewer', () => {
    const noPermission: Array<T.PermissionRole> =
      [T.PermissionRole.VIEWER, T.PermissionRole.MEMBER];
    const approvedPermision: Array<T.PermissionRole> =
      [T.PermissionRole.ADMIN, T.PermissionRole.PILOT];

    noPermission.forEach((permission) => {
      dispatchProps.onUploadClick(permission);
      expect(dispatch).toHaveBeenCalledWith({
        popup: T.ContentPagePopupType.NO_PERMISSION,
        type: 'ddm/pages/OPEN_CONTENT_PAGE_POPUP',
      });
    });

    approvedPermision.forEach((permission) => {
      dispatchProps.onUploadClick(permission);
      expect(dispatch).toHaveBeenCalledWith({
        popup: T.ContentPagePopupType.UPLOAD,
        type: 'ddm/pages/OPEN_CONTENT_PAGE_POPUP',
      });
    });
  });
});

describe('StateProps', () => {
  type MockState = Pick<T.State, 'Contents' | 'Pages' | 'Projects' | 'ProjectConfigPerUser' | 'PlanConfig' | 'Users' | 'Auth'>;
  const mockState: MockState = {
    Pages: M.mockPages,
    Projects: M.mockProjects,
    PlanConfig: M.mockPlanConfig,
    Contents: M.mockContents,
    ProjectConfigPerUser: M.mockProjectConfigPerUser,
    Users: M.mockUsers,
    Auth: M.mockAuth,
  };
  let stateProps: StateProps;

  beforeEach(() => {
    stateProps = mapStateToProps(mockState);
  });

  it('should have same value with original tab', () => {
    expect(stateProps.currentTab).toBe(mockState.Pages.Contents.sidebarTab);
  });
});

describe('Connected ContentsTabbar', () => {
  const createOwnProps: () => OwnProps = () => ({
    in3D: false,
  });
  let ownProps: OwnProps;
  let store: DDMMockStore;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    ownProps = createOwnProps();
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should not emit an error during rendering', () => {
    expect(() => {
      ReactTesting.render(
        <Provider store={store}>
          <ContentsTabbar {...ownProps} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});
