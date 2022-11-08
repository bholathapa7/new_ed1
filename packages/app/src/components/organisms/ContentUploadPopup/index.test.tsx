import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import ContentUploadPopup, { Props } from './';

describe('ContentUploadPopup', () => {
  const createProps: () => Props = () => ({
    zIndex: 300,
    onSourcePhotoClick: jest.fn(),
    onOrthophotoClick: jest.fn(),
    onBlueprintClick: jest.fn(),
    onDsmClick: jest.fn(),
    onClose: jest.fn(),
    onPointCloudClick: jest.fn(),
    onDesignClick: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <ContentUploadPopup {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should display a list item for each types of content files', () => {
    // eslint-disable-next-line no-magic-numbers
    expect(renderResult.container.querySelectorAll('li')).toHaveLength(7);
  });
});
