import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import * as M from '^/store/Mock';
import * as T from '^/types';

import ProjectAcceptPopup from './';

const projects: Array<T.Project> = [M.mockProjects.projects.byId[1]];

storiesOf('Organisms|ProjectAcceptPopup', module)
  .add('default', () => (
    <ProjectAcceptPopup
      zIndex={0}
      projects={projects}
      onDecide={action('onDecide')}
      onClose={action('onClose')}
    />
  ));
