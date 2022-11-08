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

import ProjectListTab, {
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

  it('should call dispatch when call openPopup', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.openPopup(T.ProjectPagePopupType.ACCEPT);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should call dispatch when call onSettingClick', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.onSettingClick(M.mockProjects.projects.byId[M.mockProjects.projects.allIds[0]]);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('should call dispatch when call onProjectClick', () => {
    expect(dispatch).toHaveBeenCalledTimes(0);
    dispatchProps.onProjectClick(M.sampleSingleProject);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe('StateProps', () => {
  type MockState = Pick<T.State, 'Auth' | 'Projects' | 'Pages'>;
  const mockState: MockState = {
    Auth: M.mockAuth,
    Projects: M.mockProjects,
    Pages: M.mockPages,
  };
  let stateProps: StateProps;

  beforeEach(() => {
    stateProps = mapStateToProps(mockState);
  });

  it('should have all projects in state', () => {
    for (const project of stateProps.projects) {
      expect(project).toBe(mockState.Projects.projects.byId[project.id]);
    }
  });
});

describe('Connected ProjectListTab', () => {
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
          <ProjectListTab {...props} />
        </Provider>,
      );
    }).not.toThrowError();
  });
});
