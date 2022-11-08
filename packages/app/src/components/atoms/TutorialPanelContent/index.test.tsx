import * as ReactTesting from '@testing-library/react';
import React from 'react';

import { commonAfterEach } from '^/utilities/test-util';

import AddPoint from '^/assets/icons/tutorial-illustration-add-a-point.png';

import TutorialPanelContent, { Props } from './';

describe('TutorialPanelContent', () => {
  const createProps: () => Props = () => ({
    heading: 'How to sell squid',
    explanation: 'Go to ulleung-do',
    image: AddPoint,
  });

  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <TutorialPanelContent {...props} />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  it('should correctly render props', () => {
    expect(renderResult.getByTestId('tutorialpanelcontent-heading').textContent)
      .toEqual('How to sell squid');
    expect(renderResult.getByTestId('tutorialpanelcontent-explanation').textContent)
      .toEqual('Go to ulleung-do');
    expect(renderResult.getByTestId('tutorialpanelcontent-ImageWrapper')
      .innerHTML.toString()).toContain('img');
  });
});
