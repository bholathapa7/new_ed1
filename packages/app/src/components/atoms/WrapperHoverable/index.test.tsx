import * as ReactTesting from '@testing-library/react';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import WrapperHoverable, { Props } from './';

/**
 * @todo add meaningful tests
 */
describe('WrapperHoverable', () => {
  const createProps: () => Props = () => ({
    title: 'Tooltip Title',
    customStyle: {},
  });
  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <WrapperHoverable {...props} />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should render TooltipBalloon', () => {
    ReactTesting.fireEvent.mouseEnter(renderResult.getByTestId('wrapperhoverable-target'));
    expect(renderResult.queryAllByText(props.title)).toHaveLength(1);
  });
});
