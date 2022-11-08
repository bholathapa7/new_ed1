import React, { FC } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

interface EnabledProp {
  enabled: boolean;
}

const Root = styled.div<EnabledProp>({
  display: 'flex',
  boxSizing: 'border-box',
  width: '29px',
  height: '16px',

  paddingRight: '2px',
  paddingLeft: '2px',

  alignItems: 'center',

  borderRadius: '10px',

  cursor: 'pointer',
}, ({ enabled }) => ({
  justifyContent: enabled ? 'flex-end' : 'flex-start',
  backgroundColor: (enabled ? palette.ContentsList.toggleSwitchBlue : palette.icon).toString(),
}));

const ToggleButton = styled.div({
  boxSizing: 'border-box',
  position: 'relative',
  width: '13px',
  height: '12px',
  borderRadius: '10px',
  backgroundColor: palette.white.toString(),
});

export type Props = EnabledProp & {
  onClick?(): void;
};

const ToggleSlider: FC<Props> = ({ enabled, onClick }) => {
  const onToggle: () => void = () => {
    if (onClick) onClick();
  };

  return (
    <Root
      onClick={onToggle}
      enabled={enabled}
      data-testid='toggle-switch'
    >
      <ToggleButton />
    </Root>
  );
};

export default ToggleSlider;
