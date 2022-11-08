import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import CoordinateSystemDropdown, { Props } from '.';

describe('CoordinateSystemDropdown', () => {
  const createProps: () => Props = () => ({
    value: 'GRS80',
    onSelect: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.EN_US);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <CoordinateSystemDropdown {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should display placeholder on dropdown when there is no value', () => {
    expect(renderResult.queryAllByText(/Please select/)).toHaveLength(1);

    renderResult.rerender(
      <Provider store={store}>
        <CoordinateSystemDropdown {...props} value={undefined} />
      </Provider>,
    );
    expect(renderResult.queryAllByText(/Please select/)).toHaveLength(1);
  });

  it('should display error notification', () => {
    const text: ReactTesting.Matcher = /\* Please select the coordinate system used./;
    expect(renderResult.queryAllByText(text)).toHaveLength(0);

    renderResult.rerender(
      <Provider store={store}>
        <CoordinateSystemDropdown {...props} isError={true} />
      </Provider>,
    );
    expect(renderResult.queryAllByText(text)).toHaveLength(1);
  });

  it('should call onSelect when dropdown value is changed', () => {
    expect(props.onSelect).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.getByTestId('dropdown-mainbutton'));
    ReactTesting.fireEvent.click(renderResult.getAllByTestId('dropdown-item')[0]);
    expect(props.onSelect).toHaveBeenCalledTimes(1);
  });
});

