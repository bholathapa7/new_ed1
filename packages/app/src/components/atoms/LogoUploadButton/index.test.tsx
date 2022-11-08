import * as ReactTesting from '@testing-library/react';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';
import LogoUploadButton, { Props } from './';

describe('LogoUploadButton', () => {
  let renderResult: ReactTesting.RenderResult;
  const createProps: () => Props = () => ({
    handleFileSelect: jest.fn(),
    handleFileSelectClick: jest.fn(),
  });
  let props: Props;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <LogoUploadButton {...props} />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should call handleFileSelect when file selected', () => {
    const dummyFile: File = new File([''], 'dummy');

    expect(props.handleFileSelect).toHaveBeenCalledTimes(0);
    ReactTesting.fireEvent.change(renderResult.getByTestId('input'), {
      currentTarget: { files: [dummyFile] },
    });
    expect(props.handleFileSelect).toHaveBeenCalledTimes(1);
  });
});
