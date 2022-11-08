import * as ReactTesting from '@testing-library/react';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import FrontFooter from './';

describe('FrontFooter', () => {
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    renderResult = ReactTesting.render(
      <FrontFooter />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should display a support email with mailto link', () => {
    expect(renderResult.queryAllByText(/info@angelswing\.io/)).toHaveLength(1);
    expect(renderResult.getByText(/info@angelswing\.io/).getAttribute('href'))
      .toBe('mailto:info@angelswing.io');
  });

  it('should display facebook icon with appropriate link', () => {
    expect(renderResult.container.querySelectorAll('.fa.fa-facebook')).toHaveLength(1);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(renderResult.container.querySelector('.fa.fa-facebook')!.getAttribute('href'))
      .toBe('https://www.facebook.com/angelswing.io');
  });
});
