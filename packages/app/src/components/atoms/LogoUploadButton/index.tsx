import palette from '^/constants/palette';
import React, { FC, SyntheticEvent } from 'react';
import styled from 'styled-components';

import FaIcon from '^/components/atoms/FaIcon';

const UploadButton= styled.label({
  position: 'absolute',
  right: '10px',
  bottom: '10px',
  width: '21px',
  height: '21px',

  borderRadius: '50%',
  backgroundColor: palette.textGray.toString(),

  cursor: 'pointer',

  fontSize: '12px',
  lineHeight: '21px',
  color: palette.white.toString(),
  textAlign: 'center',

  '& > input': {
    display: 'none',
  },
});

export interface Props {
  handleFileSelectClick(event: SyntheticEvent<HTMLInputElement>): void;
  handleFileSelect(event: SyntheticEvent<HTMLInputElement>): void;
}

const LogoUploadButton: FC<Props> = ({ handleFileSelectClick, handleFileSelect }) => (
  <UploadButton>
    <FaIcon faNames='camera' fontSize='inherit' />
    <input
      type='file'
      accept='image/jpeg, image/png'
      onClick={handleFileSelectClick}
      onChange={handleFileSelect}
      data-testid='input'
    />
  </UploadButton>
);
LogoUploadButton.displayName = 'LogoUploadButton';

export default LogoUploadButton;
