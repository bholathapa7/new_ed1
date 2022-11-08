import { storiesOf } from '@storybook/react';
import React from 'react';

import AddPoint from '^/assets/icons/tutorial-illustration-add-a-point.png';
import DeletePoint from '^/assets/icons/tutorial-illustration-delete-a-point.png';

import TutorialPanelContent, { Props } from './';

storiesOf('Atoms|TutorialPanelContent', module)
  .add('with add a point illustration', () => {
    const props: Props = {
      heading: 'Add a point',
      explanation: 'Drag the point with plus mark to add a new point in between.',
      image: AddPoint,
    };

    return (
      <TutorialPanelContent {...props} />
    );
  })
  .add('with delete a point illustration', () => {
    const props: Props = {
      heading: 'Delete a point',
      explanation: 'Click the point and press backspace key to delete a point.',
      image: DeletePoint,
    };

    return (
      <TutorialPanelContent {...props} />
    );
  });
