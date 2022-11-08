import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import ProjectPage from './';

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
jest.mock('^/components/organisms/ProjectMarketTab', () => {
  const { createElement }: typeof React = require('react');

  return require('^/utilities/make-es-module').default({
    default: () => createElement(
      'div',
      {
        'data-testid': 'test-project-market-tab',
      },
    ),
  });
});
jest.mock('^/components/organisms/ProjectPilotTab', () => {
  const { createElement }: typeof React = require('react');

  return require('^/utilities/make-es-module').default({
    default: () => createElement(
      'div',
      {
        'data-testid': 'test-project-pilot-tab',
      },
    ),
  });
});
jest.mock('^/components/organisms/ProjectListTab', () => {
  const { createElement }: typeof React = require('react');

  return require('^/utilities/make-es-module').default({
    default: () => createElement(
      'div',
      {
        'data-testid': 'test-project-list-tab',
      },
    ),
  });
});
jest.mock('^/components/organisms/ProjectManageTab', () => {
  const { createElement }: typeof React = require('react');

  return require('^/utilities/make-es-module').default({
    default: () => createElement(
      'div',
      {
        'data-testid': 'test-project-manage-tab',
      },
    ),
  });
});
jest.mock('^/components/organisms/ProjectMypageTab', () => {
  const { createElement }: typeof React = require('react');

  return require('^/utilities/make-es-module').default({
    default: () => createElement(
      'div',
      {
        'data-testid': 'test-project-mypage-tab',
      },
    ),
  });
});

describe('ProjectPage', () => {
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <MemoryRouter>
          <ProjectPage />
        </MemoryRouter>
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should not display a modal background for undefined popup value', () => {
    renderResult.rerender(
      <Provider store={store}>
        <MemoryRouter>
          <ProjectPage />
        </MemoryRouter>
      </Provider>,
    );

    expect(renderResult.queryAllByTestId(/modal-background/)).toHaveLength(0);
  });
});
