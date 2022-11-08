import * as ReactTesting from '@testing-library/react';
import Map from 'ol/Map';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import {
  Provider as TestOlMapProvider,
} from '^/components/atoms/OlMapProvider/context';

import OlMapDOMEventHandler, { Props } from './';

describe('OlMapDOMEventHandler', () => {
  const map: Map = new Map({});
  const createProps: () => Props = () => ({
    type: 'contextmenu',
    onEvent: jest.fn(),
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <TestOlMapProvider value={map}>
        <OlMapDOMEventHandler {...props} />
      </TestOlMapProvider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render nothing', () => {
    expect(renderResult.container.children).toHaveLength(0);
  });
});
