import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import SignInForm, { validationErrorToMessage } from './';

describe('SignInForm', () => {
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <MemoryRouter>
          <SignInForm />
        </MemoryRouter>
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should show "required" errors when email and password are empty', () => {
    const formElement = renderResult.container.querySelector('form');
    const [emailInput, passwordInput] = renderResult.container.querySelectorAll('ul input');
    ReactTesting.fireEvent.change(emailInput, {
      target: {
        value: '',
      },
    });
    ReactTesting.fireEvent.change(passwordInput, {
      target: {
        value: '',
      },
    });
    if (formElement === null) {
      throw Error('formElement should not be null');
    }
    ReactTesting.fireEvent.submit(formElement);
    const [emailError, passwordError] = renderResult.getAllByText(`* ${validationErrorToMessage.email.required[T.Language.KO_KR]}`);
    expect(emailError).not.toBeNull();
    expect(emailError).not.toBeUndefined();
    expect(passwordError).not.toBeNull();
    expect(passwordError).not.toBeUndefined();
  });

  it('should show errors "pattern" for an invalid email and "required" for an empty password', () => {
    const formElement = renderResult.container.querySelector('form');
    const [emailInput, passwordInput] = renderResult.container.querySelectorAll('ul input');
    ReactTesting.fireEvent.change(emailInput, {
      target: {
        value: '123@456',
      },
    });
    ReactTesting.fireEvent.change(passwordInput, {
      target: {
        value: '',
      },
    });
    if (formElement === null) {
      throw Error('formElement should not be null');
    }
    ReactTesting.fireEvent.submit(formElement);
    const emailError = renderResult.getAllByText(`* ${validationErrorToMessage.email.pattern[T.Language.KO_KR]}`);
    expect(emailError).not.toBeNull();
    expect(emailError).not.toBeUndefined();
    const passwordError = renderResult.getByText(`* ${validationErrorToMessage.password.required[T.Language.KO_KR]}`);
    expect(passwordError).not.toBeNull();
    expect(passwordError).not.toBeUndefined();
  });

  it('should show "minLength" error for a password at length < 6', () => {
    const formElement = renderResult.container.querySelector('form');
    const [, passwordInput] = renderResult.container.querySelectorAll('ul input');
    ReactTesting.fireEvent.change(passwordInput, {
      target: {
        value: 'hi 12',
      },
    });
    if (formElement === null) {
      throw Error('formElement should not be null');
    }
    ReactTesting.fireEvent.submit(formElement);
    const passwordError = renderResult.getByText(`* ${validationErrorToMessage.password.minLength[T.Language.KO_KR]}`);
    expect(passwordError).not.toBeNull();
    expect(passwordError).not.toBeUndefined();
  });

  it('should show "maxLength" error for a password at length > 22', () => {
    const formElement = renderResult.container.querySelector('form');
    const [, passwordInput] = renderResult.container.querySelectorAll('ul input');
    ReactTesting.fireEvent.change(passwordInput, {
      target: {
        value: 'loremipsumdolorsitamet 123456789 loremipsumdolorsitamet',
      },
    });
    if (formElement === null) {
      throw Error('formElement should not be null');
    }
    ReactTesting.fireEvent.submit(formElement);
    const emailError = renderResult.getAllByText(`* ${validationErrorToMessage.email.required[T.Language.KO_KR]}`);
    expect(emailError).not.toBeNull();
    expect(emailError).not.toBeUndefined();
    const passwordError = renderResult.getByText(`* ${validationErrorToMessage.password.maxLength[T.Language.KO_KR]}`);
    expect(passwordError).not.toBeNull();
    expect(passwordError).not.toBeUndefined();
  });

  it('should show "validCharacter" error for an invalid password', () => {
    const formElement = renderResult.container.querySelector('form');
    const [, passwordInput] = renderResult.container.querySelectorAll('ul input');
    ReactTesting.fireEvent.change(passwordInput, {
      target: {
        value: 'Lorem Ipsum 123!',
      },
    });
    if (formElement === null) {
      throw Error('formElement should not be null');
    }
    ReactTesting.fireEvent.submit(formElement);
    const emailError = renderResult.getAllByText(`* ${validationErrorToMessage.email.required[T.Language.KO_KR]}`);
    expect(emailError).not.toBeNull();
    expect(emailError).not.toBeUndefined();
    const passwordError = renderResult.getByText(`* ${validationErrorToMessage.password.validCharacter[T.Language.KO_KR]}`);
    expect(passwordError).not.toBeNull();
    expect(passwordError).not.toBeUndefined();
  });

  it('should show "pattern" error for an invalid password', () => {
    const formElement = renderResult.container.querySelector('form');
    const [, passwordInput] = renderResult.container.querySelectorAll('ul input');
    ReactTesting.fireEvent.change(passwordInput, {
      target: {
        value: 'loremipsum123!',
      },
    });
    if (formElement === null) {
      throw Error('formElement should not be null');
    }
    ReactTesting.fireEvent.submit(formElement);
    const emailError = renderResult.getAllByText(`* ${validationErrorToMessage.email.required[T.Language.KO_KR]}`);
    expect(emailError).not.toBeNull();
    expect(emailError).not.toBeUndefined();
    const passwordError = renderResult.getByText(`* ${validationErrorToMessage.password.pattern[T.Language.KO_KR]}`);
    expect(passwordError).not.toBeNull();
    expect(passwordError).not.toBeUndefined();
  });

  it('should show "pattern" error for an invalid password', () => {
    const formElement = renderResult.container.querySelector('form');
    const [, passwordInput] = renderResult.container.querySelectorAll('ul input');
    ReactTesting.fireEvent.change(passwordInput, {
      target: {
        value: '123123!!',
      },
    });
    if (formElement === null) {
      throw Error('formElement should not be null');
    }
    ReactTesting.fireEvent.submit(formElement);
    const emailError = renderResult.getAllByText(`* ${validationErrorToMessage.email.required[T.Language.KO_KR]}`);
    expect(emailError).not.toBeNull();
    expect(emailError).not.toBeUndefined();
    const passwordError = renderResult.getByText(`* ${validationErrorToMessage.password.pattern[T.Language.KO_KR]}`);
    expect(passwordError).not.toBeNull();
    expect(passwordError).not.toBeUndefined();
  });
});

