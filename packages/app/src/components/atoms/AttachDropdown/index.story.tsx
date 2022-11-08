import { action } from '@storybook/addon-actions';
import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React from 'react';

import AttachDropdown, { Option } from '.';

const story: StoryApi = storiesOf('Atoms|AttachDropdown', module);

// eslint-disable-next-line no-magic-numbers
const options: Array<Option> = Array(20).fill({
  text: 'SO LOOOOOOOOOOOOOOOONG TEXT',
  value: '20200211',
});

story.add('default', () => (
  <div style={{ width: '193px', height: '37px' }}>
    <AttachDropdown
      text='Attach Dropdown'
      options={options}
      fileExtension='.csv'
      noOptionText='없음'
      attachFileText='.CSV 첨부'
      onAttach={action('onAttach')}
      onClick={action('onClick')}
    />
  </div>
));

story.add('no options', () => (
  <div style={{ width: '193px', height: '37px' }}>
    <AttachDropdown
      text='Attach Dropdown'
      options={[]}
      fileExtension='.csv'
      noOptionText='없음'
      attachFileText='.CSV 첨부'
      onAttach={action('onAttach')}
      onClick={action('onClick')}
    />
  </div>
));
