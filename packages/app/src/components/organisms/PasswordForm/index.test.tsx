import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';
import { l10n } from '^/utilities/l10n';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import PasswordForm, { Props, validationErrorToMessage } from './';

describe('PasswordForm', () => {
  const createProps: () => Props = () => ({
    formValues: {
      email: '',
    },
    resetPasswordStatus: T.APIStatus.IDLE,
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
        <PasswordForm {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  const getForm: () => HTMLFormElement = () =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    renderResult.container.querySelector('form')!;
  const getEmailInput: () => HTMLInputElement = () =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    renderResult.container.querySelector('input')!;

  it('should display a button for patch user\'s password', () => {
    expect(renderResult.container.querySelectorAll('button')).toHaveLength(1);
  });

  it('should not display a patch button when patch is idle', () => {
    renderResult.rerender(
      <Provider store={store}>
        <PasswordForm {...props} resetPasswordStatus={T.APIStatus.IDLE} />
      </Provider>,
    );

    expect(renderResult.queryByTestId('loading-button')).toBeNull();
  });

  it('should display a spinner icon in the patch button when patch is in progress', () => {
    renderResult.rerender(
      <Provider store={store}>
        <PasswordForm {...props} resetPasswordStatus={T.APIStatus.PROGRESS} />
      </Provider>,
    );

    expect(renderResult.queryByTestId('loading-button')).toBeDefined();
  });

  it('should not call onSubmit with an empty email on form submit, and show a required error message', () => {
    expect(props.onSubmit).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.submit(getForm());
    expect(props.onSubmit).toHaveBeenCalledTimes(0);
    const errorMessage = renderResult.getByText(`* ${l10n(validationErrorToMessage.email.required, T.Language.KO_KR)}`);
    expect(errorMessage).not.toBeNull();
    expect(errorMessage).not.toBeUndefined();
  });

  it('should not call onSubmit with an invaild email on form submit', () => {
    expect(props.onSubmit).toHaveBeenCalledTimes(0);
    renderResult.rerender(
      <Provider store={store}>
        <PasswordForm {...props} formValues={{
          email: 'invaild@',
        }} />
      </Provider>,
    );
    ReactTesting.fireEvent.submit(getForm());
    expect(props.onSubmit).toHaveBeenCalledTimes(0);
  });

  it('should not call onSubmit with an invaild email on form submit', () => {
    expect(props.onSubmit).toHaveBeenCalledTimes(0);
    renderResult.rerender(
      <Provider store={store}>
        <PasswordForm {...props} formValues={{
          email: 'invaild',
        }} />
      </Provider>,
    );
    ReactTesting.fireEvent.submit(getForm());
    expect(props.onSubmit).toHaveBeenCalledTimes(0);
  });

  it('should not call onSubmit with an invaild email on form submit, and show a pattern error message', () => {
    expect(props.onSubmit).toHaveBeenCalledTimes(0);
    renderResult.rerender(
      <Provider store={store}>
        <PasswordForm {...props} formValues={{
          email: 'invaild@email',
        }} />
      </Provider>,
    );
    ReactTesting.fireEvent.submit(getForm());
    expect(props.onSubmit).toHaveBeenCalledTimes(0);
    const errorMessage = renderResult.getByText(`* ${l10n(validationErrorToMessage.email.pattern, T.Language.KO_KR)}`);
    expect(errorMessage).not.toBeNull();
    expect(errorMessage).not.toBeUndefined();
  });

  it('should call onSubmit with a vaild email on form submit', () => {
    expect(props.onSubmit).toHaveBeenCalledTimes(0);
    renderResult.rerender(
      <Provider store={store}>
        <PasswordForm {...props} formValues={{
          email: 'changhyeon@angelswing.io',
        }} />
      </Provider>,
    );
    ReactTesting.fireEvent.submit(getForm());
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should not call onChange when the value of the email input does not vary', () => {
    ReactTesting.fireEvent.change(getEmailInput(), {
      target: {
        value: props.formValues.email,
      },
    });
    expect(props.onChange).toHaveBeenCalledTimes(0);
  });

  it('should call change handler when the value of the email input varies', () => {
    expect(props.onChange).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.change(getEmailInput(), {
      target: {
        value: 'afefw@gmew.com',
      },
    });
    expect(props.onChange).toHaveBeenCalledTimes(1);
  });
});
