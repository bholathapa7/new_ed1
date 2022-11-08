import { storiesOf } from '@storybook/react';
import React, { FC, useState } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';
import { UseState } from '^/hooks';
import { AttachUploadTitleInput as TitleInput } from '.';

const Wrapper = styled.div({
  width: '250px',
  backgroundColor: palette.white.toString(),

  padding: '50px',
});

const Component: FC<{ hasError?: boolean }> = ({ hasError }) => {
  const [title, setTitle]: UseState<string> = useState('');

  return (
    <Wrapper>
      <TitleInput
        title={title}
        setTitle={setTitle}
        hasError={hasError}
      />
    </Wrapper>
  );
};

storiesOf('Molecules|AttachUploadTitleInput', module)
  .add('default', () => (
    <Component />
  ))
  .add('with error', () => (
    <Component hasError={true} />
  ));
