import * as ReactTesting from '@testing-library/react';
import Map from 'ol/Map';
import React, { FC } from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import {
  Provider as TestOlMapProvider,
} from '^/components/atoms/OlMapProvider/context';

import olWrap, { WrapperProps } from './';

describe('olWrap', () => {
  const map: Map = new Map({});

  describe('with Trivial Component', () => {
    const TestComp: FC<WrapperProps> = () => <div data-testid='children' />;
    let renderResult: ReactTesting.RenderResult;

    beforeEach(() => {
      const Wrapped: FC = olWrap(TestComp);
      renderResult = ReactTesting.render(
        <TestOlMapProvider value={map}>
          <Wrapped />
        </TestOlMapProvider>,
      );
    });

    afterEach(ReactTesting.cleanup);
    afterEach(commonAfterEach);

    it('should render its children', () => {
      expect(renderResult.queryByTestId('children')).toBeTruthy();
    });
  });

  describe('with Component Using Map', () => {
    const TestComp: FC<WrapperProps> =
      (props) => <div>{`${props.map.getSize()}`}</div>;
    let renderResult: ReactTesting.RenderResult;

    beforeEach(() => {
      const Wrapped: FC = olWrap(TestComp);
      renderResult = ReactTesting.render(
        <TestOlMapProvider value={map}>
          <Wrapped />
        </TestOlMapProvider>,
      );
    });

    afterEach(ReactTesting.cleanup);
    afterEach(commonAfterEach);

    it('should render its children', () => {
      expect(renderResult.queryByText(`${map.getSize()}`)).toBeTruthy();
    });
  });

  describe('with Component Using Map and other Props', () => {
    interface Props {
      value: number;
    }
    const TestComp: FC<Props & WrapperProps> =
      (props) => <div>{`${props.map.getRevision()},${props.value}`}</div>;
    let renderResult: ReactTesting.RenderResult;

    beforeEach(() => {
      const Wrapped: FC<Props> = olWrap(TestComp);
      renderResult = ReactTesting.render(
        <TestOlMapProvider value={map}>
          <Wrapped value={1} />
        </TestOlMapProvider>,
      );
    });

    afterEach(ReactTesting.cleanup);
    afterEach(commonAfterEach);

    it('should render its children', () => {
      expect(renderResult.queryByText(`${map.getRevision()},1`)).toBeTruthy();
    });
  });

  /**
   * @todo Add tests for LayerGroup
   */
});
