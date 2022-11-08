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

import PasswordPage, { Props } from './';

describe('PasswordPage', () => {
  const createProps: () => Props = () => ({
    passwordResetStatus: T.APIStatus.IDLE,
    passwordResetError: undefined,
    isPlanConfigLoaded: true,
    resetEmail: jest.fn(),
    resetPasswordResetStatus: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    store = createDDMMockStore(T.Language.KO_KR);
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <MemoryRouter>
          <PasswordPage {...props} />
        </MemoryRouter>
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it(`should display a form in ${T.APIStatus.IDLE} state`, () => {
    renderResult.rerender(
      <Provider store={store}>
        <MemoryRouter>
          <PasswordPage {...props} passwordResetStatus={T.APIStatus.IDLE} />
        </MemoryRouter>
      </Provider>,
    );

    expect(renderResult.container.querySelectorAll('form')).toHaveLength(1);
  });

  it(`should display a form in ${T.APIStatus.PROGRESS} state`, () => {
    renderResult.rerender(
      <Provider store={store}>
        <MemoryRouter>
          <PasswordPage {...props} passwordResetStatus={T.APIStatus.PROGRESS} />
        </MemoryRouter>
      </Provider>,
    );

    expect(renderResult.container.querySelectorAll('form')).toHaveLength(1);
  });

  it(`should not display a form in ${T.APIStatus.ERROR} state`, () => {
    renderResult.rerender(
      <Provider store={store}>
        <MemoryRouter>
          <PasswordPage {...props} passwordResetStatus={T.APIStatus.ERROR} />
        </MemoryRouter>
      </Provider>,
    );

    expect(renderResult.container.querySelectorAll('form')).toHaveLength(0);
  });

  it(`should not display a form in ${T.APIStatus.SUCCESS} state`, () => {
    renderResult.rerender(
      <Provider store={store}>
        <MemoryRouter>
          <PasswordPage {...props} passwordResetStatus={T.APIStatus.SUCCESS} />
        </MemoryRouter>
      </Provider>,
    );

    expect(renderResult.container.querySelectorAll('form')).toHaveLength(0);
  });
});
