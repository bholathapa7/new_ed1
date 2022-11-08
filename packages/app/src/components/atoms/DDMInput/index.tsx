import styled from 'styled-components';

import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';

export interface Props {
  hasError?: boolean;
}

export const DDMInput = styled.input<Props>(({ hasError }) => ({
  boxSizing: 'border-box',

  width: '100%',
  height: '100%',
  paddingLeft: '12px',

  border: `1px solid ${(hasError ? palette.DDMInput.error : palette.DDMInput.inputBorder).toString()}`,
  borderRadius: '5px',
  color: hasError ? palette.DDMInput.error.toString() : dsPalette.title.toString(),
  fontSize: '13px',

  // eslint-disable-next-line no-magic-numbers
  backgroundColor: hasError ? palette.DDMInput.error.alpha(0.05).toString() : undefined,

  '::placeholder': {
    color: (hasError ? palette.DDMInput.error : palette.dividerLight).toString(),
  },
}));
