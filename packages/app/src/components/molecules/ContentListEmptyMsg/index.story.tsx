import { storiesOf } from '@storybook/react';
import React from 'react';

import * as T from '^/types';
import ContentListEmptyMsg from './';

storiesOf('Molecules|ContentListEmptyMsg', module)
  .add('map', () => <ContentListEmptyMsg currentTab={T.ContentPageTabType.MAP} />)
  .add('measurement', () => <ContentListEmptyMsg currentTab={T.ContentPageTabType.MEASUREMENT} />)
  .add('overlay', () => <ContentListEmptyMsg currentTab={T.ContentPageTabType.OVERLAY} />);
