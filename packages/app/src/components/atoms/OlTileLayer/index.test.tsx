import * as ReactTesting from '@testing-library/react';
import Map from 'ol/Map';
import { Extent } from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import { get } from 'ol/proj';
import XYZSource from 'ol/source/XYZ';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import {
  Provider as TestOlMapProvider,
} from '^/components/atoms/OlMapProvider/context';

import OlTileLayer, { Props } from './';

describe('OlTileLayer', () => {
  const map: Map = new Map({});
  const createProps: () => Props = () => ({
    url: 'test url',
    projection: get('EPSG:3857'),
    preload: 0,
    zIndex: 0,
    onPrerender: jest.fn(),
    onPostrender: jest.fn(),
    loadTile: jest.fn(),
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <TestOlMapProvider value={map}>
        <OlTileLayer {...props} />
      </TestOlMapProvider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should create tile layer with appropriate properties', () => {
    const layer: TileLayer = map.getLayers().item(0) as TileLayer;
    const source: XYZSource = layer.getSource() as XYZSource;
    expect(source.getUrls()).toEqual([props.url]);
    expect(source.getProjection().getCode()).toBe(props.projection.getCode());
    expect(source.getTileLoadFunction()).toBe(props.loadTile);
    expect(layer.getPreload()).toBe(props.preload);
    expect(layer.getZIndex()).toBe(props.zIndex);
    /**
     * @todo test onPrerender & onPostrender
     * (Is it possible?)
     */
  });

  it('should change extent on prop change', () => {
    const extent: Extent = [0, 0, 0, 0];
    renderResult.rerender(
      <TestOlMapProvider value={map}>
        <OlTileLayer {...props} extent={extent} />
      </TestOlMapProvider>,
    );
    expect(map.getLayers().item(0).getExtent()).toEqual(extent);
  });

  it('should change preload on prop change', () => {
    const preload: number = props.preload + 1;
    renderResult.rerender(
      <TestOlMapProvider value={map}>
        <OlTileLayer {...props} preload={preload} />
      </TestOlMapProvider>,
    );
    expect((map.getLayers().item(0) as TileLayer).getPreload()).toEqual(preload);
  });

  it('should change zIndex on prop change', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const zIndex: number = props.zIndex! + 1;
    renderResult.rerender(
      <TestOlMapProvider value={map}>
        <OlTileLayer {...props} zIndex={zIndex} />
      </TestOlMapProvider>,
    );
    expect(map.getLayers().item(0).getZIndex()).toBe(zIndex);
  });

  it('should change source on prop change', () => {
    const source: XYZSource = (map.getLayers().item(0) as TileLayer).getSource() as XYZSource;
    const url: string = `${props.url} `;
    renderResult.rerender(
      <TestOlMapProvider value={map}>
        <OlTileLayer {...props} url={url} />
      </TestOlMapProvider>,
    );
    const newSource: XYZSource = (map.getLayers().item(0) as TileLayer).getSource() as XYZSource;
    expect(source).not.toBe(newSource);
    expect(newSource.getUrls()).toEqual([url]);
  });
});
