import * as ReactTesting from '@testing-library/react';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import GuageBar, { Props } from './';

describe('GuageBar', () => {
  const createProps: () => Props = () => ({
    ratio: 0,
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <GuageBar {...props} />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should show appropriate ratio of guage according to prop', () => {
    expect(renderResult.getByTestId('guagebar-guage')).toHaveStyleRule('width', '0%');

    const ratio: number = 0.5;
    renderResult.rerender(
      <GuageBar {...props} ratio={ratio} />,
    );
    expect(renderResult.getByTestId('guagebar-guage')).toHaveStyleRule('width', '50%');
  });
});
