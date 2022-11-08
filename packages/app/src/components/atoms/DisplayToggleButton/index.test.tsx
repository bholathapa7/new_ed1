import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import { DDMMockStore, commonAfterEach, createDDMMockStore } from '^/utilities/test-util';

import * as T from '^/types';

import DisplayToggleButton from './';

import { ChangeIn3D } from '^/store/duck/Pages';

describe('DisplayToggleButton', () => {
  let renderResult: ReactTesting.RenderResult;
  let store: DDMMockStore;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <DisplayToggleButton />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render without problem', () => {
    expect(renderResult).toBeTruthy();
  });

  it.skip('should toggle when click', () => {
    const in3D: boolean = store.getState().Pages.Contents.in3D;

    expect(store.getActions().length).toBe(0);
    ReactTesting.fireEvent.click(renderResult.getByTestId('toggle-button'));
    expect(store.getActions()[0]).toMatchObject(ChangeIn3D({ in3D: !in3D }));
  });
});
