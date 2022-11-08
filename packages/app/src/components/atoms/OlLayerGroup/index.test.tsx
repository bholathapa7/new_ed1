import * as ReactTesting from '@testing-library/react';
import Map from 'ol/Map';
import LayerGroup from 'ol/layer/Group';
import React, { ReactElement } from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import {
  Provider as TestOlMapProvider,
} from '^/components/atoms/OlMapProvider/context';

import OlLayerGroup, { Props } from './';
import {
  Provider as TestOlLayerGroupProvider,
} from './context';

describe('OlLayerGroup', () => {
  const map: Map = new Map({});
  const layerGroup: LayerGroup = new LayerGroup();
  let renderResult: ReactTesting.RenderResult;

  describe('without LayerGroup', () => {
    const testReactElement: (layerGroupProps: Props) => ReactElement = (
      layerGroupProps,
    ) => (
      <TestOlMapProvider value={map}>
        <OlLayerGroup {...layerGroupProps} />
      </TestOlMapProvider>
    );

    beforeEach(() => {
      renderResult = ReactTesting.render(testReactElement({}));
    });

    afterEach(ReactTesting.cleanup);
    afterEach(commonAfterEach);

    it('should accept different props', () => {
      expect(() => {
        renderResult.rerender(testReactElement({
          opacity: 0.5,
          visible: true,
          zIndex: 1,
        }));
      }).not.toThrowError();
    });

    it('should accept same props twice', () => {
      renderResult.rerender(testReactElement({
        opacity: 0.3,
        visible: false,
        zIndex: -1,
      }));
      expect(() => {
        renderResult.rerender(testReactElement({
          opacity: 0.3,
          visible: false,
          zIndex: -1,
        }));
      }).not.toThrowError();
    });
  });

  describe('with LayerGroup', () => {
    const testReactElement: (layerGroupProps: Props) => ReactElement = (
      layerGroupProps,
    ) => (
      <TestOlMapProvider value={map}>
        <TestOlLayerGroupProvider value={layerGroup}>
          <OlLayerGroup {...layerGroupProps} />
        </TestOlLayerGroupProvider>
      </TestOlMapProvider>
    );

    beforeEach(() => {
      renderResult = ReactTesting.render(testReactElement({}));
    });

    afterEach(ReactTesting.cleanup);
    afterEach(commonAfterEach);

    it('should accept different props', () => {
      expect(() => {
        renderResult.rerender(testReactElement({
          opacity: 0.5,
          visible: true,
          zIndex: 1,
        }));
      }).not.toThrowError();
    });

    it('should accept same props twice', () => {
      renderResult.rerender(testReactElement({
        opacity: 0.3,
        visible: false,
        zIndex: -1,
      }));
      expect(() => {
        renderResult.rerender(testReactElement({
          opacity: 0.3,
          visible: false,
          zIndex: -1,
        }));
      }).not.toThrowError();
    });
  });
});
