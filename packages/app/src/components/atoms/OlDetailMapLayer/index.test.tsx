import * as ReactTesting from '@testing-library/react';
import Map from 'ol/Map';
import React, { ReactElement } from 'react';

import * as T from '^/types';

import { commonAfterEach } from '^/utilities/test-util';

import * as M from '^/store/Mock';

import {
  Provider as TestOlMapProvider,
} from '^/components/atoms/OlMapProvider/context';

import OlDetailMapLayer, { Props } from './';

describe('OlDetailMapLayer', () => {
  const map: Map = new Map({});
  const createProps: () => Props = () => ({
    zoom: 1,
    center: [0, 0],
    content: M.sampleContentFromType(T.ContentType.MAP) as T.MapContent,
    changeZoom: jest.fn(),
    changeCenter: jest.fn(),
    changeFirstVisit: jest.fn(),
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  const testReactElement: (mapProps: Props) => ReactElement<any> = (
    mapProps,
  ) => (
    <TestOlMapProvider value={map} >
      <OlDetailMapLayer {...mapProps} />
    </TestOlMapProvider>
  );

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(testReactElement(props));
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should accept different content', () => {
    expect(() => {
      renderResult.rerender(testReactElement({
        ...props,
        content: {
          ...props.content,
          id: 3,
        },
      }));
    }).not.toThrowError();
  });

  it('should accept same props twice', () => {
    const newProps: Props = {
      ...props,
      content: M.sampleContentFromType(T.ContentType.MAP) as T.MapContent,
      zIndex: 3,
    };

    renderResult.rerender(testReactElement(newProps));
    expect(() => renderResult.rerender(testReactElement(newProps))).not.toThrowError();
  });

  it('should accept content with tms zooms', () => {
    expect(() => {
      renderResult.rerender(testReactElement({
        ...props,
        content: {
          ...props.content,
          info: {
            ...props.content.info,
            tms: {
              zoomLevels: [0, 1],
              boundaries: {
                0: {
                  minLon: 0,
                  minLat: 0,
                  maxLon: 1,
                  maxLat: 1,
                },
                1: {
                  minLon: 0,
                  minLat: 0,
                  maxLon: 1,
                  maxLat: 1,
                },
              },
            },
          },
        },
      }));
    }).not.toThrowError();
  });

  it('should accept content with tms zooms and boundaries', () => {
    expect(() => {
      renderResult.rerender(testReactElement({
        ...props,
        content: {
          ...props.content,
          info: {
            ...props.content.info,
            tms: {
              zoomLevels: [1],
              boundaries: {
                1: {
                  minLat: 1,
                  minLon: 1,
                  maxLat: 2,
                  maxLon: 3,
                },
              },
            },
          },
        },
      }));
    }).not.toThrowError();
  });
});
