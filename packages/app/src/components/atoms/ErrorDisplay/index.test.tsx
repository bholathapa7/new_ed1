import * as ReactTesting from '@testing-library/react';
import React, { ReactNode } from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import palette from '^/constants/palette';

import ErrorDisplay from './';

describe('ErrorDisplay', () => {
  const children: ReactNode = 'abc';
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    renderResult = ReactTesting.render(
      <ErrorDisplay>{children}</ErrorDisplay>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should displayed with 100% width and 100% height', () => {
    expect(renderResult.container.children).toHaveLength(1);
    expect(renderResult.container.children[0]).toHaveStyleRule('width', '100%');
    expect(renderResult.container.children[0]).toHaveStyleRule('height', '100%');
  });

  it('should displayed with gray background', () => {
    expect(renderResult.container.children[0])
      .toHaveStyleRule('background', palette.background.toString().replace(/\s/g, ''));
  });

  it('should display message of props on center of root tag', () => {
    expect(renderResult).not.toHaveStyleRule('position', expect.anything());

    expect(renderResult.getByTestId('errordisplay-wrapper'))
      .toHaveStyleRule('position', 'relative');

    expect(renderResult.getByTestId('errordisplay-message').textContent)
      .toBe(children);
    expect(renderResult.getByTestId('errordisplay-message'))
      .toHaveStyleRule('position', 'absolute');
    expect(renderResult.getByTestId('errordisplay-message'))
      .toHaveStyleRule('top', '50%');
    expect(renderResult.getByTestId('errordisplay-message'))
      .toHaveStyleRule('left', '50%');
    expect(renderResult.getByTestId('errordisplay-message'))
      .toHaveStyleRule('transform', /^(.* )?translate\(-50%, ?-50%\)( .*)?/);
  });

  it('should display message in white round box', () => {
    expect(renderResult.getByTestId('errordisplay-message'))
      .toHaveStyleRule('background', palette.white.toString().replace(/\s/g, ''));
    expect(renderResult.getByTestId('errordisplay-message'))
      .toHaveStyleRule('border-radius', '3px');
  });

  it('should display message with readable color and size', () => {
    expect(renderResult.getByTestId('errordisplay-message'))
      .toHaveStyleRule('color', palette.textGray.toString().replace(/\s/g, ''));
    expect(renderResult.getByTestId('errordisplay-message'))
      .toHaveStyleRule('font-size', '15px');
  });
});
