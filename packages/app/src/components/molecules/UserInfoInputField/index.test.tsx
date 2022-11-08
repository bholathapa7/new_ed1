import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import UserInfoInputField, { Props } from './';

describe('UserInfoInputField', () => {
  const createProps: () => Props = () => ({
    kind: 'email',
    value: 'this is name',
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
        <UserInfoInputField {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should display value as a input value', () => {
    expect(renderResult.queryAllByDisplayValue(props.value)).toHaveLength(1);
  });

  it('should use password input when kind of field is password', () => {
    renderResult.rerender(
      <Provider store={store}>
        <UserInfoInputField {...props} kind='password' />
      </Provider>,
    );
    expect(renderResult.getByDisplayValue(props.value).getAttribute('type')).toBe('password');
  });

  it('should use password input when kind of field is passwordConfirmation', () => {
    renderResult.rerender(
      <Provider store={store}>
        <UserInfoInputField {...props} kind='passwordConfirmation' />
      </Provider>,
    );
    expect(renderResult.getByDisplayValue(props.value).getAttribute('type')).toBe('password');
  });

  it('should call change handler with the kind and new value of input when input is changed', () => {
    const value: string = 'abce';
    expect(props.onChange).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.change(renderResult.getByDisplayValue(props.value), {
      target: {
        value,
      },
    });
    expect(props.onChange).toHaveBeenCalledTimes(1);
    expect(props.onChange).toHaveBeenLastCalledWith(props.kind, value);
  });

  it('should display one label', () => {
    expect(renderResult.container.getElementsByTagName('label')).toHaveLength(1);
  });

  it('should display different style from original one after passing error string', () => {
    const originalClass: string = renderResult.getByDisplayValue(props.value).className;
    renderResult.rerender(
      <Provider store={store}>
        <UserInfoInputField {...props} error='표시할 수 없습니다.' />
      </Provider>,
    );
    const newClass: string = renderResult.getByDisplayValue(props.value).className;

    expect(originalClass).not.toBe(newClass);
  });

  it('should not display tag for error message when it is undefined', () => {
    expect(renderResult.queryAllByTestId('sign-up-input-field-error')).toHaveLength(0);
  });

  it('should display error message with \'*\' when it is defined', () => {
    const error: string = '잘못된 이름입니다.';
    renderResult.rerender(
      <Provider store={store}>
        <UserInfoInputField {...props} error={error} />
      </Provider>,
    );

    expect(renderResult.getByTestId('sign-up-input-field-error').textContent).toBe(`* ${error}`);
  });

  it('should have additionalInfoMessage when kind is email', () => {
    expect(renderResult.getByTestId('sign-up-input-field-additional-info').textContent)
      .toMatch(/\* /);
  });
});
