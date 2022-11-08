import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import { Story } from '^/story.types';
import React from 'react';

import { CheckForm } from '.';
import { Item } from './item';

const items: Item[] = [{ id: 1, text: '체크체크체크체크체크체크체크체크체크체크' }];

const story: Story = storiesOf('Atoms|CheckForm', module);

story.add('default', () => (
  <CheckForm items={items} checkedItemIds={[]} onClick={action('onClick')} />
));
