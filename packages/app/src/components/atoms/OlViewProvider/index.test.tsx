/* eslint-disable no-magic-numbers */
import * as ReactTesting from '@testing-library/react';
import React from 'react';
import styled from 'styled-components';

import { commonAfterEach } from '^/utilities/test-util';

import OlViewProvider, { Props } from './';

describe('OlViewProvider', () => {
  const WrapperObj = styled.div.attrs({
    'data-testid': 'test-wrapper',
  })``;
  const createProps: () => Props = () => ({
    Wrapper: WrapperObj,
    center: [0, 0],
    zoom: 1,
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <OlViewProvider {...props} />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should have one and just one Wrapper of props', () => {
    expect(renderResult.queryByTestId('test-wrapper')).toBeTruthy();
  });

  it('should accept different props', () => {
    expect(() => {
      renderResult.rerender(
        <OlViewProvider
          {...props}
          center={[0, 1]}
          zoom={2}
          minZoom={1}
          maxZoom={3}
        />,
      );
    }).not.toThrowError();
  });

  it('should accept same props twice', () => {
    renderResult.rerender(
      <OlViewProvider
        {...props}
        center={[1, 1]}
        zoom={3}
        minZoom={2}
        maxZoom={6}
      />,
    );
    expect(() => {
      renderResult.rerender(
        <OlViewProvider
          {...props}
          center={[1, 1]}
          zoom={3}
          minZoom={2}
          maxZoom={6}
        />,
      );
    }).not.toThrowError();
  });
});
