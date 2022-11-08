import React, { FC, MouseEvent, ReactNode, memo } from 'react';
import styled from 'styled-components';

import ArrowSVG from '^/assets/icons/contents-list/arrow.svg';
import palette from '^/constants/palette';

const HeadingRoot = styled.button<{ isOpened: boolean }>({
  position: 'relative',
  width: '112px',
  height: '20px',

  display: 'flex',
  justifyContent: 'flex-start',
  padding: '5px 13px',
  alignItems: 'center',

  borderTopLeftRadius: '7px',
  borderTopRightRadius: '7px',

  color: palette.ElevationProfile.lengthTitle.toString(),

  cursor: 'pointer',
}, ({ isOpened }) => ({
  /* eslint-disable no-magic-numbers */
  backgroundColor: isOpened
    ? palette.SideBar.ContentslistBackground.alpha(0.9).toString()
    : palette.white.alpha(0.8).toString(),
  /* eslint-enable no-magic-numbers */
}));

const HeadingTitle = styled.div({
  maxWidth: '92.5px',

  fontSize: '10px',
  fontWeight: 'bold',
  textAlign: 'left',

  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  marginRight: '3px',
});

const IconContainer = styled.div({
  marginRight: '6px',
});

const ArrowIcon = styled(ArrowSVG)<{ isOpened: boolean }>(({ isOpened }) => ({
  position: 'absolute',
  right: '6px',
  top: '5.5px',
  transform: `rotate(${isOpened ? '0' : '180'}deg)`,
}));

export interface Props {
  readonly title: string;
  readonly icon: ReactNode;
  readonly isOpened: boolean;
  readonly className?: string;
  onClick(e: MouseEvent): void;
}

const HorizontalTabToggle: FC<Props> = ({ icon, title, isOpened, onClick, className }) => (
  <HeadingRoot
    className={className}
    onClick={onClick}
    isOpened={isOpened}
    data-testid='horizontal-tab-toggle-button'
  >
    <IconContainer>
      {icon}
    </IconContainer>
    <HeadingTitle>
      {title}
    </HeadingTitle>
    <ArrowIcon isOpened={isOpened} />
  </HeadingRoot>
);

export default memo(HorizontalTabToggle);
