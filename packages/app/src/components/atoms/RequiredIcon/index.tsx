import React, { FC, ReactChild } from 'react';
import styled from 'styled-components';

const Root = styled.sup({
  fontSize: '18px',
  lineHeight: 1,
  fontWeight: 'normal',
  color: 'var(--color-theme-primary-lightest)',
});

export interface Props {
  readonly icon?: ReactChild;
}

const RequiredIcon: FC<Props> = ({ icon }) => (
  <Root>{icon === undefined ? '*' : icon}</Root>
);
export default RequiredIcon;
