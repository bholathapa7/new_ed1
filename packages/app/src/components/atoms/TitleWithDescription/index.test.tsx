import * as ReactTesting from '@testing-library/react';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import TitleWithDescription from './';

/**
 * @todo add meaningful tests
 */
describe('TitleWithDescription', () => {
  const title: string = 'title';
  const description: string = 'description';
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    renderResult = ReactTesting.render(
      <TitleWithDescription
        title={title}
        description={description}
      />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render title and description', () => {
    expect(renderResult.queryByText(title)).toBeTruthy();
    expect(renderResult.queryByText(description)).toBeTruthy();
  });
});
