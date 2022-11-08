import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import * as M from '^/store/Mock';
import * as T from '^/types';

import ProjectManageTab from './';

const timezoneOffset: number = 9;

storiesOf('Organisms|ProjectManageTab', module)
  .add('default', () =>
    // Remember to comment-out 'ProjectPermissionTable' from component render to make story works
    (
      <ProjectManageTab
        patchStatus={T.APIStatus.SUCCESS}
        project={M.mockProjects.projects.byId[1]}
        timezoneOffset={timezoneOffset}
        auth={M.mockAuth}
        slug={''}
        onDeleteClick={action('onDeleteClick')}
        onShareClick={action('onShareClick')}
        onSubmit={action('onSubmit')}
        fetchPermission={action('fetchPermission')}
        displayNoPermissionPopup={action('displayNoPermissionPopup')}
        changeAuthedUser={action('changeAuthedUser')}
        updateCoordinates={updateCoordinatesStory}
      />
    )
  );

async function updateCoordinatesStory(): Promise<void> {
  return;
}
