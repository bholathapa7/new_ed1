import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import PasswordResetForm, { Props } from './';

describe('PasswordResetForm', () => {
  const createProps: () => Props = () => ({
    formValues: {
      password: '',
      passwordConfirmation: '',
    },
    passwordToken: 'a',
    patchPasswordStatus: T.APIStatus.IDLE,
    onChange: jest.fn(),
    onSubmit: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <PasswordResetForm {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should have one hidden and two displayed inputs of password type', () => {
    // eslint-disable-next-line no-magic-numbers
    expect(renderResult.container.querySelectorAll('input[type="password"]')).toHaveLength(3);
    expect(renderResult.container.querySelectorAll('input[type="password"]')[0])
      .toHaveStyleRule('display', 'none');
    expect(renderResult.container.querySelectorAll('input[type="password"]')[1])
      .not.toHaveStyleRule('display', 'none');
    expect(renderResult.container.querySelectorAll('input[type="password"]')[2])
      .not.toHaveStyleRule('display', 'none');
  });

  const getPasswordInput: () => HTMLInputElement = () =>
    renderResult.container.querySelectorAll('input[type="password"]')[1] as HTMLInputElement;
  const getForm: () => HTMLFormElement = () =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    renderResult.container.querySelector('form')!;

  it('should not call onChange on input change when form values do not vary', () => {
    expect(props.onChange).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.change(getPasswordInput(), {
      target: {
        value: '',
      },
    });
    expect(props.onChange).toHaveBeenCalledTimes(0);
  });

  it('should call onChange on input change when form values vary', () => {
    expect(props.onChange).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.change(getPasswordInput(), {
      target: {
        value: 'asdfgwe1da',
      },
    });
    expect(props.onChange).toHaveBeenCalledTimes(1);
  });

  it('should not call onSubmit on form submit when passwordToken is undefined', () => {
    renderResult.rerender(
      <Provider store={store}>
        <PasswordResetForm {...props} passwordToken={undefined} />
      </Provider>,
    );

    expect(props.onSubmit).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.submit(getForm());
    expect(props.onSubmit).toHaveBeenCalledTimes(0);
  });

  it('should not call onSubmit on form submit when password and passwordConfirmation are not the same', () => {
    const formValues: T.NewPasswordFormValues = {
      password: 'afwefrr2r30',
      passwordConfirmation: 'afwefrr2r',
    };
    renderResult.rerender(
      <Provider store={store}>
        <PasswordResetForm {...props} formValues={formValues} />
      </Provider>,
    );

    expect(props.onSubmit).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.submit(getForm());
    expect(props.onSubmit).toHaveBeenCalledTimes(0);
  });

  it('should call onSubmit on form submit when passwordToken/password/passwordConfirmation are valid', () => {
    const formValues: T.NewPasswordFormValues = {
      password: 'afwefrr2r30',
      passwordConfirmation: 'afwefrr2r30',
    };
    renderResult.rerender(
      <Provider store={store}>
        <PasswordResetForm {...props} formValues={formValues} />
      </Provider>,
    );

    expect(props.onSubmit).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.submit(getForm());
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });
});
