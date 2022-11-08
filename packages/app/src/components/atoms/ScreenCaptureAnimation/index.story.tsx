import { storiesOf } from '@storybook/react';
import React from 'react';

import ScreenCaptureAnimation from './';

storiesOf('Atoms|ScreenCaptureAnimation', module)
  .add('shown', () => <ScreenCaptureAnimation isShown={true} />)
  .add('not shown', () => <ScreenCaptureAnimation isShown={false} />);

