import { storiesOf } from '@storybook/react';
import React from 'react';

import LogoUploadButton, { Props } from './';

storiesOf('Atoms|LogoUploadButton', module)
  .add('default', () => {
    const props: Props = {
      handleFileSelect: () => undefined,
      handleFileSelectClick: () => undefined,
    };

    return (
      <LogoUploadButton {...props} />
    );
  });
