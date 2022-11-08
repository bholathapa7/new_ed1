import * as ReactTesting from '@testing-library/react';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import BreakLineText from './';

describe('BreakLineText', () => {
  const textArray: Array<string> = ['데이터를 정상적으로 업로드하였습니다.', '도면을 처리하는데에 시간이 소요됩니다.'];
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    renderResult = ReactTesting.render(
      <BreakLineText>
        {textArray}
      </BreakLineText>);
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should have correct number of br elements', () => {
    expect(renderResult.container.querySelectorAll('br'))
      .toHaveLength(textArray.length - 1);
  });
});
