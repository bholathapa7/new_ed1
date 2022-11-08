import * as ReactTesting from '@testing-library/react';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import AutosizeTextarea from './';

describe('AutosizeTextarea', () => {
  let handleChange: jest.Mock;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    handleChange = jest.fn();
    renderResult = ReactTesting.render(
      <AutosizeTextarea value='asdf' onChange={handleChange} />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render a textarea', () => {
    expect(renderResult.container.querySelector('textarea')).toBeTruthy();
  });

  it('should have same height with its shadow', () => {
    /**
     * @todo Introducing PhantomJS?
     */
  });
});
