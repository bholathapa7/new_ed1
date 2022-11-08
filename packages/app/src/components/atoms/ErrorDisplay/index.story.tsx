import { storiesOf } from '@storybook/react';
import React from 'react';

import ErrorDisplay from './';

storiesOf('Atoms|ErrorDisplay', module)
  .add('default', () => (
    <ErrorDisplay>ErrorDisplay의 예시입니다.<br />An example of ErrorDisplay</ErrorDisplay>
  ));
