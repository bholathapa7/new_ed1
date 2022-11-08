import * as ReactTesting from '@testing-library/react';
import Color from 'color';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import Modal from './';

describe('Modal', () => {
  const backgroundColor: Color = new Color('#ffffff');
  const zIndex: number = 0;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    renderResult = ReactTesting.render(
      <Modal backgroundColor={backgroundColor} zIndex={zIndex}>
        <div data-testid='children' />
      </Modal>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render its child', () => {
    expect(renderResult.queryByTestId('children')).toBeTruthy();
  });
});
