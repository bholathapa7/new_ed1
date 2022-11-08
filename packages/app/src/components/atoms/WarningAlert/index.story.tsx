import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';

import WarningAlert from '.';

const story: StoryApi = storiesOf('Atoms|WarningAlert', module);

story.add('default', () => (
  <WarningAlert texts={['선택된 데이터세트에 덮어써야 하는 데이터가 존재합니다.']} />
));
