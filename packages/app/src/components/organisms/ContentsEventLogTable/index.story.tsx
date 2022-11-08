import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';

import ContentsEventLogTable from '.';

const story: StoryApi = storiesOf('Organisms|ContentsEventLogTable', module);

story.add('default', () => <ContentsEventLogTable />);
