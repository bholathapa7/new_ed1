import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import * as M from '^/store/Mock';
import { APIStatus } from '^/types';

import ProjectDeletePopup, { Props } from './';

const props: Props = {
  zIndex: 0,
  project: M.mockProjects.projects.byId[1],
  deleteStatus: APIStatus.SUCCESS,
  resetAPIStatus: action('resetAPIStatus'),
  onClose: action('onClose'),
  onSubmit: action('onSubmit'),
  onSuccess: action('onSuccess'),
};

storiesOf('Organisms|ProjectDeletePopup', module)
  .add('success', () => (
    <ProjectDeletePopup {...props} />
  ))
  .add('progress', () => (
    <ProjectDeletePopup
      {...props}
      deleteStatus={APIStatus.PROGRESS}
    />
  ))
  .add('error', () => (
    <ProjectDeletePopup
      {...props}
      deleteStatus={APIStatus.ERROR}
    />
  ));
