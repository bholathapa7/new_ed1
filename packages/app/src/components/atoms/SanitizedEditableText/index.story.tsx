import { storiesOf } from '@storybook/react';
import React from 'react';

import { SanitizedEditableText } from './';

storiesOf('Atoms|SanitizedEditableText ', module)
  .add('default', () => (
    <SanitizedEditableText
      htmlId='hello-id-id'
      text='abc'
    />
  ));
