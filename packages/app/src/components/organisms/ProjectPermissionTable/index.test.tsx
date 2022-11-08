import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import { mockUsers, sampleMultiplePermissions } from '^/store/Mock';

import ProjectPermissionTable, { Props } from './';

describe('ProjectPermissionTable', () => {
  const permissions: Props['permissions'] =
    sampleMultiplePermissions.map<[T.RestrictedUser, T.Permission]>((value) => [
      mockUsers.users.byId[value.userId],
      value,
    ]);
  const createProps: () => Props = () => ({
    authedRole: T.PermissionRole.ADMIN,
    permissions,
    onDelete: jest.fn(),
    onPermissionChange: jest.fn(),
    featurePermission: {},
    onFeaturePermissionChange: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <ProjectPermissionTable {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should call onDelete with appropriate argument', () => {
    renderResult.queryAllByTestId('project-permission-item-delete-button')
      .forEach((deleteButton, index) => {
        ReactTesting.fireEvent.click(deleteButton);
        expect(props.onDelete).toHaveBeenCalledTimes(1);
        expect(props.onDelete).toHaveBeenLastCalledWith(permissions[index][1].id, true);

        jest.resetAllMocks();
      });
  });
});
