import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import { sampleSingleProject } from '^/store/Mock';

import ProjectListItem, { Props } from './';

describe('ProjectListItem', () => {
  const createProps: () => Props = () => ({
    isShared: false,
    isDemo: false,
    timezoneOffset: 0,
    project: sampleSingleProject,
    onClick: jest.fn(),
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
        <ProjectListItem {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should call onClick on root click', () => {
    expect(props.onClick).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.container.children[0]);
    expect(props.onClick).toHaveBeenCalledTimes(1);
  });

  it('should call onSettingClick on setting button click', () => {
    expect(props.onSettingClick).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.getByTestId('setting-button'));
    expect(props.onSettingClick).toHaveBeenCalledTimes(1);
  });

  it('should change css when thumbnail exists', () => {
    renderResult.rerender(
      <Provider store={store}>
        <ProjectListItem {...props} project={{ ...props.project, thumbnail: undefined }} />
      </Provider>,
    );
    expect(renderResult.getByTestId('project-list-item-background'))
      .toHaveStyleRule('background-image', 'url(undefined)');

    const thumbnail: string = 'asdf';
    renderResult.rerender(
      <Provider store={store}>
        <ProjectListItem {...props} project={{ ...props.project, thumbnail }} />
      </Provider>,
    );
    expect(renderResult.getByTestId('project-list-item-background'))
      .toHaveStyleRule('background-image', `url(${thumbnail})`);
  });
});
