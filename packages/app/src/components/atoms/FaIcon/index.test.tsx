import * as ReactTesting from '@testing-library/react';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import FaIcon, { Props } from './';

describe('FaIcon', () => {
  const createProps: () => Props = () => ({
    faNames: 'box',
    fontSize: '27px',
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <FaIcon {...props} />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should expand faNames with fa- prefix', () => {
    expect(renderResult.container.querySelector('i.fa.fa-box')).toBeTruthy();

    renderResult.rerender(
      <FaIcon {...props} faNames={['box', 'mail']} />,
    );
    expect(renderResult.container.querySelector('i.fa.fa-box.fa-mail')).toBeTruthy();

    renderResult.rerender(
      <FaIcon {...props} faNames={[]} />,
    );
    expect(renderResult.container.querySelector('i.fa')).toBeTruthy();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(renderResult.container.querySelector('i.fa')!.className)
      .not.toMatch(/(.* )?fa-[^ ]*( .*)?/);
  });
});
