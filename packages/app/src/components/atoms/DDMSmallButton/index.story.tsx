import { storiesOf } from '@storybook/react';
import React from 'react';

import DDMSmallButton from './';

storiesOf('Atoms|DDMSmallButton', module)
  .add('default', () => (
    <DDMSmallButton>작은 버튼</DDMSmallButton>
  ));
