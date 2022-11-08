import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import { sampleRestrictedUser, sampleSinglePermission } from '^/store/Mock';

import ProjectPermissionItem, { Props } from './';

describe('ProjectPermissionItem', () => {
  const createProps: () => Props = () => ({
    readOnly: false,
    user: sampleRestrictedUser,
    permission: sampleSinglePermission,
    zIndex: 0,
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
        <ProjectPermissionItem {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should show appropriate avatar', () => {
    const avatar: string = 'asdf';
    renderResult.rerender(
      <Provider store={store}>
        <ProjectPermissionItem {...props} user={{ ...props.user, avatar }} />
      </Provider>,
    );
    expect(renderResult.getByAltText('user-avatar').getAttribute('src')).toBe(avatar);
  });

  it('should display predefined icon for users without avatars', () => {
    renderResult.rerender(
      <Provider store={store}>
        <ProjectPermissionItem {...props} user={{ ...props.user, avatar: undefined }} />
      </Provider>,
    );
    expect(renderResult.container.getElementsByTagName('svg').length)
      .toBeGreaterThanOrEqual(1);
  });

  it('should show pending/denied text at corresponding status', () => {
    renderResult.rerender(
      <Provider store={store}>
        <ProjectPermissionItem
          {...props}
          permission={{ ...props.permission, status: T.PermissionStatus.PENDING }}
        />
      </Provider>,
    );
    expect(renderResult.queryAllByText(/pending/i)).toHaveLength(1);

    renderResult.rerender(
      <Provider store={store}>
        <ProjectPermissionItem
          {...props}
          permission={{ ...props.permission, status: T.PermissionStatus.DENIED }}
        />
      </Provider>,
    );
    expect(renderResult.queryAllByText(/denied/i)).toHaveLength(1);
  });

  it('should call handler when delete button clicked', () => {
    expect(props.onDelete).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.getByTestId('project-permission-item-delete-button'));
    expect(props.onDelete).toHaveBeenCalledTimes(1);
  });

  it('should call appropriate handler on permission change', () => {
    ReactTesting.fireEvent.click(renderResult.getByTestId('dropdown-mainbutton'));
    ReactTesting.fireEvent.click(
      ReactTesting.within(renderResult.getByTestId('dropdown-menu'))
        .getByText(T.PermissionRole.ADMIN),
    );
    expect(props.onPermissionChange).lastCalledWith(
      sampleSinglePermission.id,
      T.PermissionRole.ADMIN,
    );
  });
});
