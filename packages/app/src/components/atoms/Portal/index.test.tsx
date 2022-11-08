import * as ReactTesting from '@testing-library/react';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import Portal, { Props } from './';

describe('Portal', () => {
  const createProps: () => Props = () => ({
    node: document.body,
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <Portal {...props}>
        <div data-testid='children' />
      </Portal>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render nothing under the original container', () => {
    expect(renderResult.container.children).toHaveLength(0);
  });

  it('should render a div on document.body', () => {
    expect(ReactTesting.queryByTestId(document.body, 'children')).toBeTruthy();
  });
});
