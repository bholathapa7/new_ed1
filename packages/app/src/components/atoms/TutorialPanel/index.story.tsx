import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import TutorialPanelContent from '^/components/atoms/TutorialPanelContent';

import AddPoint from '^/assets/icons/tutorial-illustration-add-a-point.png';
import DeletePoint from '^/assets/icons/tutorial-illustration-delete-a-point.png';

import TutorialPanel, { Props } from './';

const props: Props = {
  onCloseClick: action('onCloseClick'),
  onChange: action('onChange'),
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
  checked: true,
  label: 'Do not show this message again',
};

storiesOf('Atoms|TutorialPanel', module)
  .add('checked', () => <TutorialPanel {...props} />)
  .add('unchecked', () => <TutorialPanel {...{ ...props, checked: false }} />);

