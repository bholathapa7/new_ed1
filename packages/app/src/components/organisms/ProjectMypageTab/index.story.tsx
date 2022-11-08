import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import * as T from '^/types';

import * as M from '^/store/Mock';

import ProjectMypageTab from './';

const formValues: T.MyPageFormValues = {
  organization: '',
  contactNumber: '',
  password: '',
  passwordConfirmation: '',
  country: 'Canada',
  language: T.Language.KO_KR,
  purpose: '',
};

storiesOf('Organisms|ProjectMypageTab', module)
  .add('default', () => (
    <ProjectMypageTab
      authedUser={M.sampleFullUser}
      apiStatus={T.APIStatus.SUCCESS}
      initFormValues={formValues}
      submit={action('submit')}
      onSuccess={action('onSuccess')}
    />
  ));
