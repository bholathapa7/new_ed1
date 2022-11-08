import React, { FC } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

const Root = styled.div({
  width: '100%',
  height: '8.9px',
  borderRadius: '4px',

  backgroundColor: palette.UploadPopup.guageBarGray.toString(),
});

interface GuageProps {
  ratio: number;
}

const Guage = styled.div<GuageProps>({
  height: '8px',
  borderRadius: '4px',

  backgroundColor: 'var(--color-theme-primary)',
}, (props) => ({
  // eslint-disable-next-line no-magic-numbers
  width: `${props.ratio * 100}%`,
}));

export interface Props {
  readonly className?: string;
  readonly ratio: number;
}

const GuageBar: FC<Props> = ({ className, ratio }) => (
  <Root className={className}>
    <Guage ratio={ratio} data-testid='guagebar-guage' />
  </Root>
);

export default GuageBar;
