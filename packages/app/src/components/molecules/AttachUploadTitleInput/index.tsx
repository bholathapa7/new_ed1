import React, { FC, ChangeEvent } from 'react';
import styled from 'styled-components';

import { DDMInput } from '^/components/atoms/DDMInput';
import dsPalette from '^/constants/ds-palette';
import { UseL10n, useL10n } from '^/hooks';
import Text from './text';

const TextLabel = styled.p({
  fontSize: '14px',
  fontWeight: 'bold',
  marginBottom: '10px',

  color: dsPalette.title.toString(),
});

const InputWrapper = styled.div({
  width: '100%',
  height: '37px',
});

export interface Props {
  hasError?: boolean;
  title: string;
  setTitle(title: string): void;
}

export const AttachUploadTitleInput: FC<Props> = ({
  title, hasError,
  setTitle,
}) => {
  const [l10n]: UseL10n = useL10n();

  const onInputChange: (e: ChangeEvent<HTMLInputElement>) => void = (e) => {
    setTitle(e.currentTarget.value);
  };

  return (
    <>
      <TextLabel>{l10n(Text.contentTitle)}</TextLabel>
      <InputWrapper>
        <DDMInput
          value={title}
          placeholder={l10n(Text.placeholder)}
          hasError={hasError}
          onChange={onInputChange}
        />
      </InputWrapper>
    </>
  );
};
