import * as ReactTesting from '@testing-library/react';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import DDMInput from '.';

describe('DDMInput', () => {
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    renderResult = ReactTesting.render(
      <DDMInput error={false} />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should have valid style for errorless state', () => {
    renderResult.rerender(
      <DDMInput error={false} />,
    );
    expect(renderResult.asFragment()).toMatchSnapshot();
  });

  it('should have valid style for error state', () => {
    renderResult.rerender(
      <DDMInput error={true} />,
    );
    expect(renderResult.asFragment()).toMatchSnapshot();
  });
});
