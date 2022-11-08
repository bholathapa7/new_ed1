import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as M from '^/store/Mock';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import PointEditTutorialPanel, {
  DispatchProps,
  OwnProps,
  StateProps,
  mapDispatchToProps,
  mapStateToProps,
} from './';

const defaultFormValues: Pick<T.User, 'id'> & T.MyPageFormValues = {
  id: 111111,
  contactNumber: '',
  organization: '',
  password: '',
  passwordConfirmation: '',
  country: 'Canada',
  language: T.Language.KO_KR,
  purpose: '',
};

describe('StateProps', () => {
  type MockState = Pick<T.State, 'Pages' | 'Contents' | 'UserConfig'>;
  const mockState: MockState = {
    UserConfig: M.mockUserConfig,
    Pages: M.mockPages,
    Contents: M.mockContents,
  };
  let stateProps: StateProps;

  it('should have isEditable defined, given an editingContentId', () => {
    stateProps = mapStateToProps(mockState);
    expect(stateProps.isEditable).toBeDefined();
  });
  it('should have isEditable false, given an undefined editingContentId', () => {
    stateProps = mapStateToProps({
      ...mockState,
      Pages: {
        ...mockState.Pages,
        Project: {
          ...mockState.Pages.Project,
          editingProjectId: undefined,
        },
      },
    });
    expect(stateProps.isEditable).toBe(false);
  });
});

describe('DispatchProps', () => {
  let dispatch: jest.Mock;
  let dispatchProps: DispatchProps;

  beforeEach(() => {
    dispatch = jest.fn();
    dispatchProps = mapDispatchToProps(dispatch);
  });

  it('should call dispatch when call onClosePointEditTutorialPanel', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.onClosePointEditTutorialPanel(false);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe('Connected PointEditTutorialPanel', () => {
  const props: OwnProps = {
    isPointEditTutorialPanelShown: true,
    isEditable: true,
    originalFormValues: {
      ...defaultFormValues,
    },
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
          <PointEditTutorialPanel {...props} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});
