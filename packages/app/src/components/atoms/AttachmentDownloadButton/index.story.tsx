import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import Color from 'color';
import React from 'react';

import AttachmentDownloadButton, { Props } from './';

storiesOf('Atoms|AttachmentDownloadButton', module)
  .add('default', () => {
    const props: Props = {
      iconColor: new Color('#ff00ff'),
      fileExtension: 'LAS',
      koreanFileType: '포인트 클라우드',
      englishFileType: 'Point Cloud',
      onClick: action('click'),
    };

    return (
      <AttachmentDownloadButton {...props} />
    );
  });
