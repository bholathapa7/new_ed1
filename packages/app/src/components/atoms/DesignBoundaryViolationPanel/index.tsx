import React, { FC, memo } from 'react';
import styled from 'styled-components';

import FaIcon from '^/components/atoms/FaIcon';
import palette from '^/constants/palette';
import { UseL10n, useL10n } from '^/hooks';
import Text from './text';

const Panel = styled.div({
  padding: '14.5px 13.5px',
  position: 'absolute',
  left: '50%',
  top: '80.4%',
  transform: 'translate(-50%, 0)',
  width: '301px',
  borderRadius: '5px',
  backdropFilter: 'blur(5px)',
  // eslint-disable-next-line no-magic-numbers
  backgroundColor: palette.black.alpha(0.52).toString(),
  zIndex: 200,
});

const Title = styled.div({
  display: 'flex',
  color: palette.error.toString(),

  fontSize: '13px',
  fontWeight: 600,
  fontStretch: 'normal',
  fontStyle: 'normal',
  lineHeight: 1.54,
  letterSpacing: 'normal',
});
const Description = styled.div({
  marginTop: '8px',
  fontSize: '13px',
  fontWeight: 100,

  color: palette.white.toString(),
});
const Icon = styled.div({
  marginRight: '6px',
  width: '13px',
  height: '13px',
  borderRadius: '8px',
  backgroundColor: palette.error.toString(),
  // eslint-disable-next-line no-magic-numbers
  color: palette.black.alpha(0.52).toString(),
  fontSize: '12px',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const DesignBoundaryViolationPanel: FC = () => {
  const [l10n]: UseL10n = useL10n();

  return (
    <Panel data-testid='design-boundary-violation-panel'>
      <Title>
        <Icon>
          <FaIcon faNames='times' />
        </Icon>
        {l10n(Text.title)}
      </Title>
      <Description>
        {l10n(Text.description)}
      </Description>
    </Panel>
  );
};

export default memo(DesignBoundaryViolationPanel);
