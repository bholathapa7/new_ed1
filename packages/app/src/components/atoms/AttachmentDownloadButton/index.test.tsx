import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import palette from '^/constants/palette';

import * as T from '^/types';

import {
  DDMMockStore,
  UpdateLanguage,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import AttachmentDownloadButton, { Props } from './';

describe('AttachmentDownloadButton', () => {
  const createProps: () => Props = () => ({
    fileExtension: 'test',
    iconColor: palette.black,
    koreanFileType: '한글 종류',
    englishFileType: 'english type',
    onClick: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <AttachmentDownloadButton {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render correct contents for korean user', () => {
    store.dispatch(UpdateLanguage(T.Language.KO_KR));
    expect(renderResult.asFragment()).toMatchSnapshot();
  });

  it('should render correct contents for english user', () => {
    store.dispatch(UpdateLanguage(T.Language.EN_US));
    expect(renderResult.asFragment()).toMatchSnapshot();
  });
});
