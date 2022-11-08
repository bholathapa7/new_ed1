import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';

import { fileExtensions } from '^/components/organisms/AttachUploadPopup/fileInformation';
import palette from '^/constants/palette';
import { FileInput } from '.';

const Wrapper = styled.div({
  width: '250px',
  backgroundColor: palette.white.toString(),

  padding: '50px',
});

storiesOf('Molecules|FileInput', module)
  .add('default', () => (
    <Wrapper>
      <FileInput
        files={[]}
        extensions={fileExtensions.source}
        hasMultipleFiles={true}
        hasError={false}
        setFiles={action('setFiles')}
      />
    </Wrapper>
  ))
  .add('not validated', () => (
    <Wrapper>
      <FileInput
        files={[]}
        extensions={fileExtensions.source}
        hasMultipleFiles={true}
        hasError={true}
        setFiles={action('setFiles')}
      />
    </Wrapper>
  ))
  .add('support multiple files', () => (
    <Wrapper>
      <FileInput
        files={[]}
        extensions={fileExtensions.source}
        hasMultipleFiles={true}
        hasError={false}
        setFiles={action('setFiles')}
      />
    </Wrapper>
  ))
;
