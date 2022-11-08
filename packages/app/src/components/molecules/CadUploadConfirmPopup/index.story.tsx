import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import { Story } from '^/story.types';
import React from 'react';

import { CadUploadConfirmPopup } from '.';

const story: Story = storiesOf('Molecules|CadUploadConfirmPopup', module);

story.add('default', () => (
  <CadUploadConfirmPopup
    onPreviousClick={action('onPreviousClick')}
    onSubmitClick={action('onSubmitClick')}
    onCloseClick={action('onCloseClick')}
  />
));
