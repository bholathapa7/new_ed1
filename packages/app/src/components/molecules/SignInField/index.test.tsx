import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import SignInField, { Props } from './';

describe('SignInField', () => {
  const createProps: () => Props = () => ({
    kind: 'email',
    value: '',
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
        <SignInField {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should call change handler when child SignInInput changed', () => {
    expect(props.onChange).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.change(renderResult.container.getElementsByTagName('input')[0], {
      target: {
        value: '5',
      },
    });
    expect(props.onChange).toHaveBeenCalledTimes(1);
  });

  it('should show the error when SignInFiled received it in Props', () => {
    const errorStr: string = 'Lorem ipsum dolor sit amet, consectetur.';
    renderResult.rerender(
      <Provider store={store}>
        <SignInField {...props} error={errorStr} />
      </Provider>,
    );
    const errorRegExp = RegExp(errorStr);
    const errorMessage = renderResult.getByText(errorRegExp);
    expect(errorMessage).not.toBeUndefined();
    expect(errorMessage).not.toBeNull();
  });
});
