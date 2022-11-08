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

import SignUpPage, { Props } from './';

describe('SignUpPage', () => {
  const createProps: () => Props = () => ({
    signUpStatus: T.APIStatus.IDLE,
    isPlanConfigLoaded: true,
    resetSignUpAPI: jest.fn(),
    resetSignUpForm: jest.fn(),
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
          <SignUpPage {...props} />
        </MemoryRouter>
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it(`should display inputs in ${T.APIStatus.IDLE} state`, () => {
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <MemoryRouter>
          <SignUpPage {...props} signUpStatus={T.APIStatus.IDLE} />
        </MemoryRouter>
      </Provider>,
    );
    expect(renderResult.container.querySelectorAll('input').length).toBeGreaterThanOrEqual(1);
  });

  it(`should display inputs in ${T.APIStatus.PROGRESS} state`, () => {
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <MemoryRouter>
          <SignUpPage {...props} signUpStatus={T.APIStatus.PROGRESS} />
        </MemoryRouter>
      </Provider>,
    );
    expect(renderResult.container.querySelectorAll('input').length).toBeGreaterThanOrEqual(1);
  });

  it(`should not display inputs in ${T.APIStatus.ERROR} state`, () => {
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <MemoryRouter>
          <SignUpPage {...props} signUpStatus={T.APIStatus.ERROR} />
        </MemoryRouter>
      </Provider>,
    );
    expect(renderResult.container.querySelectorAll('input')).toHaveLength(0);
  });

  it(`should not display inputs in ${T.APIStatus.SUCCESS} state`, () => {
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <MemoryRouter>
          <SignUpPage {...props} signUpStatus={T.APIStatus.SUCCESS} />
        </MemoryRouter>
      </Provider>,
    );
    expect(renderResult.container.querySelectorAll('input')).toHaveLength(0);
  });
});
