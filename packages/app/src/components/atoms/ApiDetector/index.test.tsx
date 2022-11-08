import * as ReactTesting from '@testing-library/react';
import React from 'react';

import * as T from '^/types';

import { commonAfterEach } from '^/utilities/test-util';

import ApiDetector, { Props } from '.';

describe('ApiDetector', () => {
  const createProps: () => Props = () => ({
    status: T.APIStatus.IDLE,
    onSuccess: jest.fn(),
    onError: jest.fn(),
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <ApiDetector {...props} />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render nothing', () => {
    expect(renderResult.container.children).toHaveLength(0);
  });

  it('should call onSuccess on api success', () => {
    expect(props.onSuccess).toHaveBeenCalledTimes(0);
    renderResult.rerender(
      <ApiDetector {...props} status={T.APIStatus.PROGRESS} />,
    );
    renderResult.rerender(
      <ApiDetector {...props} status={T.APIStatus.SUCCESS} />,
    );
    expect(props.onSuccess).toHaveBeenCalledTimes(1);
    expect(props.onError).toHaveBeenCalledTimes(0);
  });

  it('should call onError on api error', () => {
    expect(props.onError).toHaveBeenCalledTimes(0);
    renderResult.rerender(
      <ApiDetector {...props} status={T.APIStatus.PROGRESS} />,
    );
    renderResult.rerender(
      <ApiDetector {...props} status={T.APIStatus.ERROR} />,
    );
    expect(props.onError).toHaveBeenCalledTimes(1);
    expect(props.onSuccess).toHaveBeenCalledTimes(0);
  });
});
