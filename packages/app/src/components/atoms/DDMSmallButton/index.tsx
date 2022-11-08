import styled from 'styled-components';

import palette from '^/constants/palette';

const DDMSmallButton = styled.button({
  display: 'inline-block',

  boxSizing: 'border-box',
  width: '80px',
  height: '40px',

  backgroundColor: palette.white.toString(),
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: palette.border.toString(),
  borderRadius: '3px',
  cursor: 'pointer',

  fontSize: '13px',
  fontWeight: 500,
  color: palette.textGray.toString(),
  lineHeight: '38px',
  textAlign: 'center',
});

export default DDMSmallButton;
