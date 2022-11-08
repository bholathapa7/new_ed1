import * as ReactTesting from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import * as T from '^/types';

import {
  DDMMockStore,
  commonAfterEach,
  createDDMMockStore,
} from '^/utilities/test-util';

import ProfileImageUploader, { Props } from './';

describe('ProfileImageUploader', () => {
  const createProps: () => Props = () => ({
    avatar: undefined,
    onUpload: jest.fn(),
  });
  let props: Props;
  let store: DDMMockStore;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    store = createDDMMockStore(T.Language.KO_KR);
    props = createProps();
    renderResult = ReactTesting.render(
      <Provider store={store}>
        <ProfileImageUploader {...props} />
      </Provider>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should display a predefined svg when avatar props is undefined', () => {
    expect(renderResult.container.querySelectorAll('svg')).toHaveLength(1);
  });

  it('should call onUpload when image is uploaded', () => {
    expect(props.onUpload).toHaveBeenCalledTimes(0);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ReactTesting.fireEvent.change(renderResult.container.querySelector('input')!, {
      target: {
        files: [new File([], 'dummy')],
      },
    });
    expect(props.onUpload).toHaveBeenCalledTimes(1);
  });
});
