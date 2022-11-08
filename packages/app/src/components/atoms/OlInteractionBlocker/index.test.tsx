import * as ReactTesting from '@testing-library/react';
import Map from 'ol/Map';
import InteractionInteraction from 'ol/interaction/Interaction';
import PointerInteraction from 'ol/interaction/Pointer';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import {
  Provider as TestOlMapProvider,
} from '^/components/atoms/OlMapProvider/context';

import OlInteractionBlocker, { Props } from './';

describe('OlInteractionBlocker', () => {
  const map: Map = new Map({});
  const createProps: () => Props = () => ({
    type: PointerInteraction,
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <TestOlMapProvider value={map}>
        <OlInteractionBlocker {...props} />
      </TestOlMapProvider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should disable all interactions of same type', () => {
    map.getInteractions().forEach((interaction: InteractionInteraction) => {
      if (interaction instanceof props.type) {
        expect(interaction.getActive()).toBe(false);
      }
    });
  });

  it('should restore interactions on unmount', () => {
    renderResult.unmount();
    map.getInteractions().forEach((interaction: InteractionInteraction) => {
      if (interaction instanceof props.type) {
        expect(interaction.getActive()).toBe(true);
      }
    });
  });

  it('should accept same map twice', () => {
    expect(() => {
      renderResult.rerender(
        <TestOlMapProvider value={map}>
          <OlInteractionBlocker {...props} />
        </TestOlMapProvider>,
      );
    }).not.toThrowError();
  });

  it('should restore interactions of previous map & disable interactions of new map', () => {
    const newMap: Map = new Map({});
    renderResult.rerender(
      <TestOlMapProvider value={newMap}>
        <OlInteractionBlocker {...props} />
      </TestOlMapProvider>,
    );
    map.getInteractions().forEach((interaction: InteractionInteraction) => {
      if (interaction instanceof props.type) {
        expect(interaction.getActive()).toBe(true);
      }
    });
    newMap.getInteractions().forEach((interaction: InteractionInteraction) => {
      if (interaction instanceof props.type) {
        expect(interaction.getActive()).toBe(false);
      }
    });
  });
});
