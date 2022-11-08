import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import { sampleSingleProject } from '^/store/Mock';

import ProjectDeletePopup, { Props } from './';

describe('ProjectDeletePopup', () => {
  const createProps: () => Props = () => ({
    project: sampleSingleProject,
    deleteStatus: T.APIStatus.IDLE,
    zIndex: 0,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    onSuccess: jest.fn(),
    resetAPIStatus: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <ProjectDeletePopup {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  const getForm: () => HTMLFormElement = () =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    renderResult.container.querySelector('form')!;
  const getPasswordInput: () => HTMLInputElement = () =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    renderResult.container.querySelector('input[type="password"]')! as HTMLInputElement;

  it('should call onSubmit on form submit', () => {
    expect(props.onSubmit).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.submit(getForm());
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(props.onSubmit).toHaveBeenLastCalledWith(props.project!.id, '');
  });

  it('should not call onSubmit on form submit when there is no project', () => {
    renderResult.rerender(
      <Provider store={store}>
        <ProjectDeletePopup {...props} project={undefined} />
      </Provider>,
    );

    ReactTesting.fireEvent.submit(getForm());
    expect(props.onSubmit).toHaveBeenCalledTimes(0);
  });

  it('should call onSubmit with changed password after password input changed', () => {
    ReactTesting.fireEvent.change(getPasswordInput(), {
      target: {
        value: 'pass',
      },
    });

    ReactTesting.fireEvent.submit(getForm());
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(props.onSubmit).toHaveBeenLastCalledWith(props.project!.id, 'pass');
  });

  it('should display different style on delete API error', () => {
    const initialStyle: string = getPasswordInput().className;

    renderResult.rerender(
      <Provider store={store}>
        <ProjectDeletePopup {...props} project={undefined} deleteStatus={T.APIStatus.ERROR} />
      </Provider>,
    );
    expect(getPasswordInput().className).not.toEqual(initialStyle);
  });

  it('should display a spinner while delete API is in progress', () => {
    expect(renderResult.container.querySelectorAll('.fa.fa-spinner')).toHaveLength(0);
    renderResult.rerender(
      <Provider store={store}>
        <ProjectDeletePopup {...props} deleteStatus={T.APIStatus.PROGRESS} />
      </Provider>,
    );
    expect(renderResult.container.querySelectorAll('.fa.fa-spinner')).toHaveLength(1);
  });

  it('should call resetAPIStatus on unmount', () => {
    expect(props.resetAPIStatus).toHaveBeenCalledTimes(0);
    renderResult.unmount();
    expect(props.resetAPIStatus).toHaveBeenCalledTimes(1);
  });
});
