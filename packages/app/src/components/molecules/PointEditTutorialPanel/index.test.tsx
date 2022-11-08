import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import PointEditTutorialPanel, { Props } from './';

describe('PointEditTutorialPanel', () => {
  const createProps: () => Props = () => ({
    onClosePointEditTutorialPanel: jest.fn(),
    isPointEditTutorialPanelShown: true,
    isEditable: true,
    originalFormValues: {
      id: 111111,
      contactNumber: '',
      organization: '',
      password: '',
      passwordConfirmation: '',
      country: 'Canada',
      language: T.Language.KO_KR,
      purpose: '',
    },
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <PointEditTutorialPanel {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('renders TutorialPanelContents', () => {
    expect(renderResult.baseElement.children[0].children[0].children)
      // eslint-disable-next-line no-magic-numbers
      .toHaveLength(3);
  });

  it('should render nothing if isEditable is false', () => {
    renderResult.rerender(
      <Provider store={store}>
        <PointEditTutorialPanel {...{ ...props, isEditable: false }} />
      </Provider>,
    );
    expect(renderResult.baseElement.children[0].children.length).toBe(0);
  });

  it('should render nothing if isPointEditTutorialPanelShown is false', () => {
    renderResult.rerender(
      <Provider store={store}>
        <PointEditTutorialPanel {...{ ...props, isPointEditTutorialPanelShown: false }} />
      </Provider>,
    );
    expect(renderResult.baseElement.children[0].children.length).toBe(0);
  });

  it('should not call onClosePointEditTutorialPanel when checkbox is not checked and close button is clicked', () => {
    renderResult.rerender(
      <Provider store={store}>
        <PointEditTutorialPanel {...{ ...props, isChecked: false }} />
      </Provider>,
    );
    ReactTesting.fireEvent.click(renderResult.getByTestId('tutorialpanel-closeicon'));
    expect(props.onClosePointEditTutorialPanel).toHaveBeenCalledTimes(0);
  });
  it('should render nothing when checkbox is not checked and close button is clicked', () => {
    renderResult.rerender(
      <Provider store={store}>
        <PointEditTutorialPanel {...{ ...props, isChecked: true }} />
      </Provider>,
    );
    ReactTesting.fireEvent.click(renderResult.getByTestId('tutorialpanel-closeicon'));
    expect(renderResult.baseElement.children[0].children.length).toBe(0);
  });
  it('should not call onClosePointEditTutorialPanel if originalFormValues is undefined', () => {
    renderResult.rerender(
      <Provider store={store}>
        <PointEditTutorialPanel {...{ ...props, originalFormValues: undefined }} />
      </Provider>,
    );
    ReactTesting.fireEvent.click(renderResult.getByTestId('tutorialpanel-closeicon'));
    expect(props.onClosePointEditTutorialPanel).toHaveBeenCalledTimes(0);
  });
});
