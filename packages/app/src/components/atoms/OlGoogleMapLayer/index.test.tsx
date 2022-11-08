import * as ReactTesting from '@testing-library/react';
import Map from 'ol/Map';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import {
  Provider as TestOlMapProvider,
} from '^/components/atoms/OlMapProvider/context';

import OlGoogleMapLayer, { Props } from './';

jest.mock('cesium');
jest.mock('^/constants/map-display', () =>
  /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
  require('^/utilities/make-es-module').default({
    cesiumDefaultCameraOrientation: {
      heading: 1,
      pitch: 1,
      roll: 1,
    },
  })
);

describe('GoogleMapLayer', () => {
  const map: Map = new Map({});
  const createProps: () => Props = () => ({
    zIndex: 0,
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <TestOlMapProvider value={map}>
        <OlGoogleMapLayer {...props} />
      </TestOlMapProvider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should append a layer to the map when mounted', () => {
    expect(map.getLayers().getLength()).toBe(1);
  });

  it('should detach a layer from the map when unmounted', () => {
    renderResult.unmount();
    expect(map.getLayers().getLength()).toBe(0);
  });
});
