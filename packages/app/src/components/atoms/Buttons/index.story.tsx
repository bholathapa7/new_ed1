import { storiesOf } from '@storybook/react';
import React from 'react';

import { CancelButton, ConfirmButton, SubmitButton } from './';

storiesOf('Atoms|V2 Button', module)
  .add('Submit', () => (
    <SubmitButton>
      {'버튼입니다'}
    </SubmitButton>
  ),
  )
  .add('Popup Confirm / Upload Button', () => (
    <ConfirmButton>
      {'I\'m a button'}
    </ConfirmButton>
  ),
  )
  .add('Popup Back / Cancel Button', () => (
    <CancelButton>
      {'ボタンです。'}
    </CancelButton>
  ),
  );
