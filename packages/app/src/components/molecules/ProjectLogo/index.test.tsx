import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import createMockStore, { MockStore, MockStoreCreator } from 'redux-mock-store';

import { imageUrl, mockPages, mockProjects } from '^/store/Mock';
import * as T from '^/types';

import { commonAfterEach } from '^/utilities/test-util';

import ProjectLogo from './';

describe('ProjectLogo', () => {
  const projectId: T.Project['id'] = 1;

  type MockState = Pick<T.State, 'Pages' | 'Projects'>;
  const mockStoreCreator: MockStoreCreator<MockState> = createMockStore<MockState>();
  const mockState: MockState = {
    Pages: {
      ...mockPages,
      Contents: {
        ...mockPages.Contents,
        projectId,
      },
    },
    Projects: {
      ...mockProjects,
      projects: {
        ...mockProjects.projects,
        byId: {
          [projectId]: {
            ...mockProjects.projects.byId[projectId],
            logo: imageUrl,
          },
        },
      },
    },
  };

  let store: MockStore<MockState>;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = mockStoreCreator(mockState);
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <ProjectLogo />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should have project logo depending on project', () => {
    expect(renderResult.container.querySelector('img')?.src).toBe(imageUrl);

    store = mockStoreCreator({
      ...mockState,
      Projects: {
        ...mockState.Projects,
        projects: {
          ...mockProjects.projects,
          byId: {
            [projectId]: {
              ...mockProjects.projects.byId[projectId],
              logo: undefined,
            },
          },
        },
      },
    });

    renderResult = ReactTesting.render(
      <Provider store={store}>
        <ProjectLogo />
      </Provider>,
    );

    expect(renderResult.container.querySelector('img')?.src).toBe(undefined);
  });
});
