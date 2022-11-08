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

import PasswordResetPage, { Props } from './';

describe('PasswordResetPage', () => {
  const createProps: () => Props = () => ({
    resetPassword: jest.fn(),
    resetPatchPasswordStatus: jest.fn(),
    isPlanConfigLoaded: true,
    needsCustomization: false,
    patchPasswordStatus: T.APIStatus.IDLE,
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
          <PasswordResetPage {...props} />
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
          <PasswordResetPage {...props} patchPasswordStatus={T.APIStatus.IDLE} />
        </MemoryRouter>
      </Provider>,
    );
    expect(renderResult.container.querySelectorAll('form')).toHaveLength(1);
  });

  it(`should display a form in ${T.APIStatus.PROGRESS} state`, () => {
    renderResult.rerender(
      <Provider store={store}>
        <MemoryRouter>
          <PasswordResetPage {...props} patchPasswordStatus={T.APIStatus.PROGRESS} />
        </MemoryRouter>
      </Provider>,
    );
    expect(renderResult.container.querySelectorAll('form')).toHaveLength(1);
  });

  it(`should not display a form in ${T.APIStatus.ERROR} state`, () => {
    renderResult.rerender(
      <Provider store={store}>
        <MemoryRouter>
          <PasswordResetPage {...props} patchPasswordStatus={T.APIStatus.ERROR} />
        </MemoryRouter>
      </Provider>,
    );
    expect(renderResult.container.querySelectorAll('form')).toHaveLength(0);
  });

  it(`should not display a form in ${T.APIStatus.SUCCESS} state`, () => {
    renderResult.rerender(
      <Provider store={store}>
        <MemoryRouter>
          <PasswordResetPage {...props} patchPasswordStatus={T.APIStatus.SUCCESS} />
        </MemoryRouter>
      </Provider>,
    );
    expect(renderResult.container.querySelectorAll('form')).toHaveLength(0);
  });
});
