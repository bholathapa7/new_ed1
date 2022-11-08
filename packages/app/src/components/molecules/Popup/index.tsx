import React, { FC, ReactNode, memo, useMemo } from 'react';
import styled, { CSSObject } from 'styled-components';

import MinimizeSvg from '^/assets/icons/minimize.svg';
import ErrorSvg from '^/assets/icons/permission-popup/error.svg';
import PreviousSVG from '^/assets/icons/popup/left-arrow.svg';
import { CloseButton } from '^/components/atoms/CloseButton';
import Modal, { Props as ModalProps } from '^/components/atoms/Modal';
import WrapperHoverable, {
  Props as WrapperHoverableProps,
} from '^/components/atoms/WrapperHoverable';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import * as T from '^/types';


const Root = styled.section({
  background: palette.white.toString(),
  borderRadius: '10px',
});
Root.displayName = 'PopupRoot';

const PopupHeader = styled.header<{ headerStyle?: CSSObject }>(({ headerStyle }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  padding: '50px 50px 10px',

  lineHeight: '29px',

  borderTopRightRadius: '10px',
  borderTopLeftRadius: '10px',

  fontSize: '20px',
  fontWeight: 'bold',
  color: dsPalette.title.toString(),
  backgroundColor: palette.white.toString(),

  ...headerStyle,
}));

const Header = styled.div({
  display: 'flex',
  alignItems: 'center',
  '> svg:first-of-type': {
    marginRight: '8px',
  },
});

const Icons = styled.div({
  display: 'flex',

  '> div + div': {
    marginLeft: '1.7px',
  },
});

const IconWrapper = styled.div({
  position: 'relative',

  width: '40px',
  height: '40px',

  cursor: 'pointer',

  ':hover': {
    borderRadius: '50%',
    backgroundColor: dsPalette.iconHover.toString(),
  },
});

const PreviousIconWrapper = styled(IconWrapper)({
  marginRight: '8px',
});

const PreviousIcon = styled(PreviousSVG)({
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
});

const MinimizeIcon = styled(MinimizeSvg)({
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
});

const PopupBody = styled.div({
  borderBottomLeftRadius: '10px',
  borderBottomRightRadius: '10px',

  backgroundColor: palette.white.toString(),
});

const PagesWrapper = styled.div({
  position: 'absolute',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  left: '50%',
  bottom: '22px',

  transform: 'translateX(-50%)',

  '> span + span': {
    marginLeft: '7px',
  },
});

const Page = styled.span<{ isOn: boolean }>(({ isOn }) => ({
  content: '\' \'',

  width: '6px',
  height: '6px',

  borderRadius: '50%',

  backgroundColor: isOn ? palette.dividerLight.toString() : palette.itemBackground.toString(),
}));


const TooltipWrapperStyle: CSSObject = {
  position: 'relative',

  display: 'inline-block',

  '> div > svg': {
    cursor: 'pointer',
  },
};
const TooltipBalloonStyle: CSSObject = {
  top: 'calc(100% + 3px)',
  bottom: 'auto',
  left: '50%',
  transform: 'translateX(-50%)',

  width: 'auto',
};
const TooltipTextTitleStyle: CSSObject = {
  whiteSpace: 'nowrap',
  padding: '5px',
  lineHeight: 1.58,
};
const TooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: TooltipWrapperStyle,
  tooltipBalloonStyle: TooltipBalloonStyle,
  tooltipTextTitleStyle: TooltipTextTitleStyle,
  tooltipBackgroundStyle: { borderRadius: '6px' },
};

type WarningType =
  T.ContentPagePopupType.DELETE_SCREEN |
  T.ContentPagePopupType.OVERWRITE_SCREEN |
  T.ContentPagePopupType.PROCESSING_FAILED |
  T.ContentPagePopupType.DELETE_GROUP |
  T.ContentPagePopupType.DELETE_PHOTO;

export interface Pagination {
  current: number;
  max: number;
}

export interface Props {
  readonly zIndex: number;
  readonly alpha: number;
  readonly title: string;
  readonly hasBlur?: ModalProps['hasBlur'];
  readonly warningType?: WarningType;
  readonly pagination?: Pagination;
  readonly closeTooltipText?: string;
  readonly headerStyle?: CSSObject;
  onPreviousClick?(): void;
  onMinimizeClick?(): void;
  onCloseClick?(): void;
}

const Popup: FC<Props> = memo(({
  hasBlur = true,
  children, zIndex, alpha, title, warningType, pagination, closeTooltipText, headerStyle,
  onPreviousClick, onMinimizeClick, onCloseClick,
}) => {
  const previousIcon: ReactNode = useMemo(() => onPreviousClick !== undefined ? (
    <PreviousIconWrapper onClick={onPreviousClick}>
      <PreviousIcon />
    </PreviousIconWrapper>
  ) : undefined, [onPreviousClick]);

  const warningSVG: ReactNode = useMemo(() => Boolean(warningType) ? (
    <ErrorSvg />
  ) : undefined, [warningType]);

  const minimizeButton: ReactNode = useMemo(() => onMinimizeClick ? (
    <IconWrapper onClick={onMinimizeClick}>
      <MinimizeIcon data-testid='popup-minimize' />
    </IconWrapper>
  ) : undefined, [onMinimizeClick]);

  const closeButton: ReactNode = useMemo(() => onCloseClick !== undefined ? (
    closeTooltipText === undefined ? (
      <CloseButton onCloseClick={onCloseClick} />
    ) : (
      <WrapperHoverable
        title={closeTooltipText}
        customStyle={TooltipCustomStyle}
      >
        <CloseButton onCloseClick={onCloseClick} />
      </WrapperHoverable>
    )
  ) : undefined, [closeTooltipText, onCloseClick]);

  const pages: ReactNode = useMemo(() => pagination !== undefined ? (
    <PagesWrapper>
      {Array.from({ length: pagination.max }, (_, i) => i + 1).map((index) => <Page key={index} isOn={index === pagination.current} />)}
    </PagesWrapper>
  ) : undefined, [pagination]);

  return (
    <Modal backgroundColor={palette.black.alpha(alpha)} zIndex={zIndex} hasBlur={hasBlur}>
      <Root data-testid='popup'>
        <PopupHeader headerStyle={headerStyle}>
          <Header data-testid='popup-title'>
            {warningSVG}
            {previousIcon}
            {title}
          </Header>
          <Icons>
            {minimizeButton}
            {closeButton}
          </Icons>
        </PopupHeader>
        <PopupBody>{children}</PopupBody>
        {pages}
      </Root>
    </Modal>
  );
});

export default Popup;
