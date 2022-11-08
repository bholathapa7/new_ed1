import React, { FC, useMemo } from 'react';
import styled from 'styled-components';


const Filled = styled.div<{
  readonly percent: number;
}>(({ percent }) => ({
  height: '100%',
  width: `${percent}%`,
  backgroundColor: 'var(--color-theme-primary)',
  transition: 'width 3s ease',
}));

const Bar = styled.div<{
  readonly opacity: number;
}>(({ opacity }) => ({
  width: '100%',
  height: '5px',
  position: 'absolute',
  left: 0,
  top: 0,
  background: '#979797',
  transition: 'opacity 6s ease',
  opacity,
}));


const TWO: number = 2;
const HUNDRED: number = 100;

export const ProgressBar: FC<{
  readonly percent: number;
}> = ({ percent }) => {
  const roundedPercent: number = Math.ceil(percent / TWO) * TWO;
  const opacity: number = useMemo(() => roundedPercent === HUNDRED ? 0 : HUNDRED, [roundedPercent]);

  return (
    <Bar opacity={opacity}>
      <Filled percent={roundedPercent} />
    </Bar>
  );
};
