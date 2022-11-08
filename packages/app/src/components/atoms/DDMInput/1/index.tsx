import styled from 'styled-components';

import palette from '^/constants/palette';

export interface Props {
  readonly error?: boolean;
}
const DDMInput = styled.input<Props>(({ error }) => ({
  boxSizing: 'border-box',

  width: '100%',
  height: '40px',
  padding: '0 20px',

  borderWidth: '1px',
  borderStyle: 'solid',
  borderRadius: '3px',

  fontSize: '13px',
  fontWeight: 'normal',
  color: palette.textGray.toString(),

  '::placeholder': {
    color: palette.textLight.toString(),
  },

  borderColor: (error ? palette.error : palette.border).toString(),
}));

export default DDMInput;
