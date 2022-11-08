import * as ReactTesting from '@testing-library/react';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import DDMSmallButton from './';

describe('DDMSmallButton', () => {
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    renderResult = ReactTesting.render(
      <DDMSmallButton />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render a button', () => {
    expect(renderResult.container.querySelectorAll('button')).toHaveLength(1);
  });
});
