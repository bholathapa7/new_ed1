import * as ReactTesting from '@testing-library/react';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import LogoPNG from './';

describe('LogoPNG', () => {
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    renderResult = ReactTesting.render(
      <LogoPNG />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render png', () => {
    expect(renderResult.container.querySelectorAll('img').length).toBeGreaterThan(0);
  });
});
