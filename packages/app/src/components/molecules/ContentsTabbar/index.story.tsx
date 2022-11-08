import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import * as T from '^/types';
import { getUserFeaturePermission } from '^/utilities/withFeatureToggle';

import ContentsTabbar, { Props } from './';

const props: Props = {
  role: T.PermissionRole.ADMIN,
  currentTab: T.ContentPageTabType.MAP,
  onUploadClick: action('Add Content PopUp'),
  onTabClick: action('Tab'),
  onLogoClick: action('Back'),
  preventAutoSelect: action('preventAutoSelect'),
  printingContentId: undefined,
  has3DView: false,
  userFeaturePermission: getUserFeaturePermission(T.Feature.DDM),
  features: { oneD: true, ess: true, ddm: true },
};

storiesOf('Molecules|ContentsTabbar', module)
  .add('Map tab', () =>
    <ContentsTabbar {...props} />,
  )
  .add('Measurement tab', () =>
    <ContentsTabbar {...props} currentTab={T.ContentPageTabType.MEASUREMENT} />,
  )
  .add('Overlay tab', () =>
    <ContentsTabbar {...props} currentTab={T.ContentPageTabType.OVERLAY} />,
  );
