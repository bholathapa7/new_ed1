import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import palette from '^/constants/palette';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import FrontTopbar, { Props } from './';

describe('FrontTopbar', () => {
  const createProps: () => Props = () => ({
    isLoginPage: false,
    isSignUpPage: false,
    isPasswordPage: false,
    toHomePage: jest.fn(),
    toLoginPage: jest.fn(),
    toSignUpPage: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.EN_US);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <FrontTopbar {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should have menu items for sign in and sign up', () => {
    expect(renderResult.queryAllByText(/sign in/i)).toHaveLength(1);
    expect(props.toLoginPage).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.getByText(/sign in/i));
    expect(props.toLoginPage).toHaveBeenCalledTimes(1);

    expect(renderResult.queryAllByText(/sign up/i)).toHaveLength(1);
    expect(props.toSignUpPage).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.getByText(/sign up/i));
    expect(props.toSignUpPage).toHaveBeenCalledTimes(1);
  });

  it('should initially have menu items only with non-selected style', () => {
    renderResult.queryAllByText(/sign /i)
      .forEach((menuItem) => {
        expect(menuItem).not.toHaveStyleRule('font-weight', '500');
        expect(menuItem)
          .toHaveStyleRule('color', palette.textLight.toString().replace(/\s/g, ''));
      });
  });

  it('should display a menu item with selected style if it is in login page or sign up page', () => {
    renderResult.rerender(
      <Provider store={store}>
        <FrontTopbar {...props} isLoginPage={true} />
      </Provider>,
    );

    expect(renderResult.getByText(/sign in/i))
      .toHaveStyleRule('font-weight', '500');
    expect(renderResult.getByText(/sign in/i))
      .toHaveStyleRule('color', palette.textGray.toString().replace(/\s/g, ''));

    renderResult.rerender(
      <Provider store={store}>
        <FrontTopbar {...props} isSignUpPage={true} />
      </Provider>,
    );

    expect(renderResult.getByText(/sign up/i))
      .toHaveStyleRule('font-weight', '500');
    expect(renderResult.getByText(/sign up/i))
      .toHaveStyleRule('color', palette.textGray.toString().replace(/\s/g, ''));

    renderResult.rerender(
      <Provider store={store}>
        <FrontTopbar {...props} isPasswordPage={true} />
      </Provider>,
    );

    expect(renderResult.getByText(/sign in/i))
      .toHaveStyleRule('font-weight', 'normal');
    expect(renderResult.getByText(/sign up/i))
      .toHaveStyleRule('font-weight', 'normal');
  });
});
