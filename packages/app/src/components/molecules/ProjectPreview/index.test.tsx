import * as ReactTesting from '@testing-library/react';
import React from 'react';

import * as T from '^/types';

import palette from '^/constants/palette';

import { commonAfterEach } from '^/utilities/test-util';

import { sampleSingleProject } from '^/store/Mock';

import ProjectPreview, { Props } from './';

describe('ProjectPreview', () => {
  const createProps: () => Props = () => ({
    project: sampleSingleProject,
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <ProjectPreview {...props} />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should have no thumbnail and title when project is undefined', () => {
    renderResult.rerender(
      <ProjectPreview {...props} project={undefined} />,
    );

    expect(renderResult.container.children[0])
      .toHaveStyleRule('background-image', 'url(undefined)');
    expect(renderResult.getByTestId('project-preview-title').textContent).toBe('');
  });

  it('should have different css with and without thumbnail', () => {
    renderResult.rerender(
      <ProjectPreview
        {...props}
        project={{ ...props.project as T.Project, thumbnail: undefined }}
      />,
    );

    expect(renderResult.container.children[0])
      .toHaveStyleRule('background-color',
        // eslint-disable-next-line no-magic-numbers
        palette.black.alpha(0.45).toString().replace(/\s/g, ''));
    expect(renderResult.container.children[0])
      .toHaveStyleRule('background-image', 'url(undefined)');

    const thumbnail: string = 'asdf';
    renderResult.rerender(
      <ProjectPreview
        {...props}
        project={{ ...props.project as T.Project, thumbnail }}
      />,
    );

    expect(renderResult.container.children[0])
      .toHaveStyleRule('background-color',
        // eslint-disable-next-line no-magic-numbers
        palette.black.alpha(0.35).toString().replace(/\s/g, ''));
    expect(renderResult.container.children[0])
      .toHaveStyleRule('background-image', `url(${thumbnail})`);
  });
});
