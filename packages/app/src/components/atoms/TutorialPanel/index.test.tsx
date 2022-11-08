import * as ReactTesting from '@testing-library/react';
import React from 'react';

import palette from '^/constants/palette';

import Color from 'color';

import { commonAfterEach } from '^/utilities/test-util';

import AddPoint from '^/assets/icons/tutorial-illustration-add-a-point.png';
import DeletePoint from '^/assets/icons/tutorial-illustration-delete-a-point.png';

import TutorialPanelContent from '^/components/atoms/TutorialPanelContent';

import TutorialPanel, { Props } from './';

describe('TutorialPanel', () => {
  const createProps: () => Props = () => ({
    checked: false,
    children: [
      () => (<TutorialPanelContent
        heading='Add a point'
        explanation='Drag the point with plus mark to add a new point in between.'
        image={AddPoint}
        key={1}
      />),
      () => (<TutorialPanelContent
        heading='Delete a point'
        explanation='Click the point and press backspace key to delete a point.'
        image={DeletePoint}
        key={2}
      />),
    ],
    label: 'HI',
    onCloseClick: jest.fn(),
    onChange: jest.fn(),
  });

  let props: Props;
  let renderResult: ReactTesting.RenderResult;

  beforeEach(() => {
    props = createProps();
    renderResult = ReactTesting.render(
      <TutorialPanel {...props} />,
    );
  });

  afterEach(ReactTesting.cleanup);
  afterEach(commonAfterEach);

  const getColorForTest: (color: Color) => string = (color) => color.toString().replace(/, /g, ',');

  it('should call onCloseClick after clicking CloseIcon', () => {
    ReactTesting.fireEvent.click(renderResult.getByTestId('tutorialpanel-closeicon'));
    expect(props.onCloseClick).toHaveBeenCalledTimes(1);
  });

  it('should render border in the middle of TutorialPanelContents', () => {
    expect(renderResult.getByTestId('tutorialpanel-divider')).toBeDefined();
  });

  it('should have a button color different than the default one', () => {
    const checkboxElements: HTMLElement = renderResult.getByTestId('ddmcheckbox-root');
    expect(checkboxElements.children[1])
      .toHaveStyleRule('color', getColorForTest(palette.textGray));
    expect(checkboxElements.children[0])
      .toHaveStyleRule('color', getColorForTest(palette.textLight));
  });
});
