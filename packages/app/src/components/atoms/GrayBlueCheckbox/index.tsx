import React, { FC, memo, useState } from 'react';
import styled, { CSSObject } from 'styled-components';

import Checkbox from '^/assets/icons/checkbox.svg';
import UnCheckbox from '^/assets/icons/uncheckbox.svg';

const CheckboxIcon = styled(Checkbox)`
  cursor: pointer;
`;
const UnCheckboxIcon = styled(UnCheckbox)`
  cursor: pointer;
`;
const HiddenInput = styled.input` 
  width: 0px;
`;

interface Props {
  readonly isChecked: boolean;
  readonly customStyle?: CSSObject;
  onClick?(): void;
}

export const GrayBlueCheckbox: FC<Props> = memo(({
  isChecked, customStyle, onClick,
}) => {
  const [isFocused, setFocus] = useState(false);

  return (
    <>
      <HiddenInput
        type='checkbox'
        checked={isChecked}
        onChange={onClick}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      />
      {
        isChecked ? (
          <CheckboxIcon style={customStyle} onClick={onClick} isFocused={isFocused} />
        ) : (
          <UnCheckboxIcon style={customStyle} onClick={onClick} isFocused={isFocused} />
        )
      }
    </>
  );
});
