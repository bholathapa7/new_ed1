import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import { sampleMultipleProjects } from '^/store/Mock';

import ProjectListTab, { Props } from './';

describe('ProjectListTab', () => {
  const createProps: () => Props = () => ({
    timezoneOffset: 0,
    userId: sampleMultipleProjects[0].owner.id,
    projects: sampleMultipleProjects,
    openPopup: jest.fn(),
    onProjectClick: jest.fn(),
    onSettingClick: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <ProjectListTab {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should call openPopup with add popup type on add button click', () => {
    ReactTesting.fireEvent.click(renderResult.container.querySelectorAll('li')[0]);
    expect(props.openPopup).toHaveBeenLastCalledWith(T.ProjectPagePopupType.ADD);
  });

  it('should call openPopup with accept popup type if there is a new pending project', () => {
    renderResult.unmount();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <ProjectListTab {...props} projects={props.projects.slice(1)} />
      </Provider>,
    );

    const newProjects: Array<T.Project> = [
      {
        ...props.projects[0],
        permissionStatus: T.AcceptStatus.PENDING,
      },
      ...props.projects.slice(1),
    ];
    renderResult.rerender(
      <Provider store={store}>
        <ProjectListTab {...props} projects={newProjects} />
      </Provider>,
    );
    expect(props.openPopup).lastCalledWith(T.ProjectPagePopupType.ACCEPT);
  });

  it('should display provided titles of accepted projects and call onProjectClick on project click', () => {
    props.projects
      .filter((project) => project.permissionStatus === T.AcceptStatus.ACCEPTED)
      .forEach((project) => {
        expect(renderResult.queryAllByText(project.title)).toHaveLength(1);

        expect(props.onProjectClick).toHaveBeenCalledTimes(0);
        ReactTesting.fireEvent.click(renderResult.getByText(project.title));
        expect(props.onProjectClick).toHaveBeenCalledTimes(1);
        expect(props.onProjectClick).toHaveBeenLastCalledWith(project);

        jest.resetAllMocks();
      });
  });

  it('should call onSettingClick on setting click', () => {
    renderResult.queryAllByTestId(/setting-button/)
      .forEach((settingButton, index) => {
        expect(props.onSettingClick).toHaveBeenCalledTimes(0);
        ReactTesting.fireEvent.click(settingButton);
        expect(props.onSettingClick).toHaveBeenCalledTimes(1);
        expect(props.onSettingClick).toHaveBeenLastCalledWith(props.projects[index]);

        jest.resetAllMocks();
      });
  });
});
