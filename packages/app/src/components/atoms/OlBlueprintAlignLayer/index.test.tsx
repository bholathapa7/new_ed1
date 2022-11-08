import * as ReactTesting from '@testing-library/react';
import Map from 'ol/Map';
import React from 'react';

import * as T from '^/types';

import { commonAfterEach } from '^/utilities/test-util';

import * as M from '^/store/Mock';

import {
  Provider as TestOlMapProvider,
} from '^/components/atoms/OlMapProvider/context';

import OlBlueprintAlignLayer, { Props } from './';

describe('OlBlueprintAlignLayer', () => {
  const map: Map = new Map({});
  const createProps: () => Props = () => ({
    content: M.sampleContentFromType(T.ContentType.BLUEPRINT_PDF) as T.BlueprintPDFContent,
    updatePoint: jest.fn(),
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <TestOlMapProvider value={map}>
        <OlBlueprintAlignLayer {...props} />
      </TestOlMapProvider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('dummy test', () => {
    expect(renderResult.container.children).toHaveLength(0);
  });

  /**
   * @todo fix this test after fixing OlOverlay component
   * to use `setElement`.
   */
  /*
  it('should updating point handler when mouse up on the pins', () => {
    expect(props.updatePoint).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.mouseUp(map.getOverlays().item(0).getElement());
    expect(props.updatePoint).toHaveBeenCalledTimes(1);
    ReactTesting.fireEvent.mouseUp(map.getOverlays().item(1).getElement());
    // eslint-disable-next-line no-magic-numbers
    expect(props.updatePoint).toHaveBeenCalledTimes(2);
  });
  */
});
