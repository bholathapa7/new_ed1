/* eslint-disable no-magic-numbers */
import * as ReactTesting from '@testing-library/react';
import React, { FC } from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import Expire, { Props } from './';

enum DELAYS {
  SMALL = 100,
  BIG = 200,
}

describe('Expire', () => {
  const Comp1: FC = () => <div>오징어</div>;
  const Comp2: FC = () => <div>엔젤스윙</div>;
  const createProps: () => Pick<Props, 'delay'> = () => ({
    delay: DELAYS.SMALL,
  });
  let props: Pick<Props, 'delay'>;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <Expire {...props}>
        <Comp1 data-testid='expire-squid' />
        <Comp2 data-testid='expire-as' />
      </Expire>,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should return null after the delay', () => {
    expect(renderResult.getByText('오징어')).toBeTruthy();
    expect(renderResult.getByText('엔젤스윙')).toBeTruthy();
    window.setTimeout(() => {
      expect(renderResult.getByText('오징어')).toBeNull();
      expect(renderResult.getByText('엔젤스윙')).toBeNull();
    }, DELAYS.BIG);
  });

  it('should not call clearTimeout when it first mounts', () => {
    jest.spyOn(window, 'clearTimeout');
    ReactTesting.render(
      <Expire {...props}>
        <Comp1 data-testid='expire-squid' />
        <Comp2 data-testid='expire-as' />
      </Expire>,
    );
    expect(clearTimeout).toBeCalledTimes(0);
  });

  it('should call clearTimeout when it unmounts', () => {
    jest.spyOn(window, 'clearTimeout');
    window.setTimeout(() => {
      expect(clearTimeout).toBeCalled();
    }, DELAYS.BIG);
  });
});
