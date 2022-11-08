import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';

import { APIStatus } from '^/types';
import ContentSharePopup, { Props } from './';

const props: Props = {
  zIndex: 1000,
  postShareStatus: APIStatus.PROGRESS,
  shareToken: 'faweG4gi4naogi24goifn23onf3!!!Rlqfmaew;fmewnewlknflewfeawrglkwnrgnaw',
  navbarLogoUrl: '',
  selectedContentIds: [],
  // eslint-disable-next-line no-magic-numbers
  cameraPosition: [123, 37],
  zoomLevel: 16,
  postShareRequest: action('postShareRequest'),
  cancelShareRequest: action('cancelShareRequest'),
  onClose: action('onClose'),
  lastSelectedScreenDate: new Date(),
  timezoneOffset: 9,
};

storiesOf('Organisms|ContentSharePopup', module)
  .add('progress',
    () => <ContentSharePopup {...props} />)
  .add('success',
    () => <ContentSharePopup {...props} postShareStatus={APIStatus.SUCCESS} />);
