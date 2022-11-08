import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import UserInfoDropdownFields, { Props } from './';

describe('UserInfoDropdownFields', () => {
  const createProps: () => Props = () => ({
    kind: 'country',
    value: 'United States',
    onChange: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <UserInfoDropdownFields {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should have appropriate label for each kinds', () => {
    const label: HTMLElement =
      renderResult.container.getElementsByTagName('label')[0];

    renderResult.rerender(
      <Provider store={store}>
        <UserInfoDropdownFields {...props} kind='country' />
      </Provider>,
    );
    expect(label.textContent).toMatchSnapshot('country label');

    renderResult.rerender(
      <Provider store={store}>
        <UserInfoDropdownFields {...props} kind='purpose' />
      </Provider>,
    );
    expect(label.textContent).toMatchSnapshot('purpose label');

    renderResult.rerender(
      <Provider store={store}>
        <UserInfoDropdownFields {...props} kind='language' />
      </Provider>,
    );
    expect(label.textContent).toMatchSnapshot('language label');
  });

  it('should have appropriate placeholder for each kinds', () => {
    const dropdownButton: HTMLElement =
      renderResult.getByTestId('dropdown-mainbutton');

    renderResult.rerender(
      <Provider store={store}>
        <UserInfoDropdownFields {...props} kind='country' value={undefined} />
      </Provider>,
    );
    expect(dropdownButton.textContent).toMatchSnapshot('country placeholder');

    renderResult.rerender(
      <Provider store={store}>
        <UserInfoDropdownFields {...props} kind='purpose' value={undefined} />
      </Provider>,
    );
    expect(dropdownButton.textContent).toMatchSnapshot('purpose placeholder');

    renderResult.rerender(
      <Provider store={store}>
        <UserInfoDropdownFields {...props} kind='language' value={undefined} />
      </Provider>,
    );
    expect(dropdownButton.textContent).toMatchSnapshot('language placeholder');
  });
});
