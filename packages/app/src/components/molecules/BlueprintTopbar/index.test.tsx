import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import BlueprintTopbar, { Props } from './';

describe('BlueprintTopbar', () => {
  const createProps: () => Props = () => ({
    closePopup: jest.fn(),
    submit: jest.fn(),
    cancel: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <BlueprintTopbar {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should call closePopup when unmounted', () => {
    expect(props.closePopup).toHaveBeenCalledTimes(0);
    renderResult.unmount();
    expect(props.closePopup).toHaveBeenCalledTimes(1);
  });

  it('should call submit when click Submit button', () => {
    renderResult.rerender(
      <Provider store={store}>
        <BlueprintTopbar {...props} />
      </Provider>,
    );

    expect(props.submit).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.getByTestId('blueprinttopbar-submit'));
    expect(props.submit).toHaveBeenCalledTimes(1);
  });

  it('should call cancel when click Cancel button', () => {
    renderResult.rerender(
      <Provider store={store}>
        <BlueprintTopbar {...props} />
      </Provider>,
    );

    expect(props.cancel).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.getByTestId('blueprinttopbar-cancel'));
    expect(props.cancel).toHaveBeenCalledTimes(1);
  });
});
