import * as ReactTesting from '@testing-library/react';
import React, { ReactChild } from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import RequiredIcon from './';

describe('RequiredIcon', () => {
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    renderResult = ReactTesting.render(
      <RequiredIcon />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render RequiredIcon with * when there is no icon props', () => {
    expect(renderResult.queryByText('*')).toBeTruthy();
  });

  it('should render RequiredIcon with icon props +', () => {
    renderResult.rerender(
      <RequiredIcon icon='+' />,
    );
    expect(renderResult.queryByText('+')).toBeTruthy();
  });

  it('should render RequiredIcon with icon props ReactChild', () => {
    const icon: ReactChild = <span>req</span>;
    renderResult.rerender(
      <RequiredIcon icon={icon} />,
    );
    expect(renderResult.getByText('req').tagName.toLowerCase()).toBe('span');
  });
});
