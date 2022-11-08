import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import DXF2RasterProcessingFailPopup, { Props } from './';

describe('DXF2RasterProcessingFailPopup', () => {
  const createProps: () => Props = () => ({
    zIndex: 350,
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <DXF2RasterProcessingFailPopup {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render a button for confirmation', () => {
    expect(renderResult.getByTestId('dxf-to-raster-processing-fail-description')).toBeDefined();
  });

  it('should call dispatch when button is clicked', () => {
    const [previousButton, confirmButton]: NodeListOf<HTMLButtonElement> =
      renderResult.container.querySelectorAll('button');
    ReactTesting.fireEvent.click(previousButton);
    expect(store.getActions()[store.getActions().length - 1]).toEqual({
      type: 'ddm/pages/OPEN_CONTENT_PAGE_POPUP',
      popup: T.ContentPagePopupType.DESIGN_UPLOAD,
    });

    ReactTesting.fireEvent.click(confirmButton);
    expect(store.getActions()[store.getActions().length - 1]).toEqual({
      type: 'ddm/pages/CLOSE_CONTENT_PAGE_POPUP',
    });
  });
});
