import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';
import Text from './text';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import UploadCompletePopup, { Props } from './';

describe('UploadCompletePopup', () => {
  const createProps: () => Props = () => ({
    success: true,
    zIndex: 0,
    type: T.AttachmentType.BLUEPRINT_PDF,
    contentId: 1,
    onClose: jest.fn(),
  });
  const language: T.Language = T.Language.KO_KR;
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(language);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <UploadCompletePopup {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  const getTitle: () => string | null = () =>
    renderResult.getByTestId('popup-title').textContent;

  it('should call onClose on confirm button click', () => {
    expect(props.onClose).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.click(renderResult.container.getElementsByTagName('button')[0]);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('should have correct title', () => {
    expect(getTitle()).toBe(Text.success.title[language]);

    renderResult.rerender(
      <Provider store={store}>
        <UploadCompletePopup {...props} success={false} />
      </Provider>,
    );

    expect(getTitle()).toBe(Text.error.title[language]);
  });
});
