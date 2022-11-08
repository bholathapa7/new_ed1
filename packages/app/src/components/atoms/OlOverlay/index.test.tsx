import * as ReactTesting from '@testing-library/react';
import _ from 'lodash-es';
import Map from 'ol/Map';
import OverlayPositioning from 'ol/OverlayPositioning';
import { fromLonLat } from 'ol/proj';
import React from 'react';

import * as T from '^/types';

import { commonAfterEach } from '^/utilities/test-util';

import {
  Provider as TestOlMapProvider,
} from '^/components/atoms/OlMapProvider/context';

import OlOverlay, { Props } from './';

describe('OlOverlay', () => {
  const map: Map = new Map({});
  const createProps: () => Props = () => ({
    position: [0, 0],
    positioning: OverlayPositioning.CENTER_CENTER,
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <TestOlMapProvider value={map}>
        <OlOverlay {...props}>
          <div />
        </OlOverlay>
      </TestOlMapProvider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should create & add overlay to map on mount', () => {
    expect(map.getOverlays().getLength()).toBe(1);
    expect(map.getOverlays().item(0).getPosition()).toEqual(fromLonLat(props.position));
    expect(map.getOverlays().item(0).getPositioning()).toBe(props.positioning);
  });

  it('should remove overlay on unmount', () => {
    renderResult.unmount();
    expect(map.getOverlays().getLength()).toBe(0);
  });

  it('should update position if prop changes', () => {
    const newPosition: T.GeoPoint = [props.position[0] + 1, props.position[1] + 1];
    renderResult.rerender(
      <TestOlMapProvider value={map}>
        <OlOverlay {...props} position={newPosition}>
          <div />
        </OlOverlay>
      </TestOlMapProvider>,
    );
    expect(map.getOverlays().item(0).getPosition()).toEqual(fromLonLat(newPosition));
  });
});
