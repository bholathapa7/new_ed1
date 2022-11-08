import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { DDMMockStore, commonAfterEach, createDDMMockStore } from '^/utilities/test-util';

import BasemapToggleButton from './';

import * as T from '^/types';

describe('BasemapToggleButton', () => {
  let renderResult: ReactTesting.RenderResult;
  let store: DDMMockStore;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <BasemapToggleButton />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render without problem', () => {
    expect(renderResult).toBeTruthy();
  });

  it('should call onClick if clicked with user', () => {
    expect(store.getActions().length).toBe(0);
    ReactTesting.fireEvent.click(renderResult.getByTestId('basemap-toggle-button'));
    expect(store.getActions()[0]).toMatchObject(({ type: 'ddm/projectConfig/PATCH_PROJECT_CONFIG' }));
  });
});
