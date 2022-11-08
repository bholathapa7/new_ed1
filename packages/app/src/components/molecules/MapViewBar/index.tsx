import React, { FC, Dispatch, ReactNode, memo, useCallback, useEffect } from 'react';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import styled, { CSSObject } from 'styled-components';

import TwoSplitSvg from '^/assets/icons/map-view-tool/2-split.svg';
import FourSplitSvg from '^/assets/icons/map-view-tool/4-split.svg';
import DefaultSvg from '^/assets/icons/map-view-tool/default-view.svg';
import SliderSvg from '^/assets/icons/map-view-tool/slider.svg';
import WrapperHoverable, { Props as WrapperHoverableProps } from '^/components/atoms/WrapperHoverable';
import palette from '^/constants/palette';
import { DeviceWidth, MediaQuery } from '^/constants/styles';
import { UseL10n, UseWindowSize, useL10n, useWindowSize } from '^/hooks';
import { RootAction } from '^/store/duck';
import { ChangeSidebarStatus, ChangeTwoDDisplayMode } from '^/store/duck/Pages';
import * as T from '^/types';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import { Fallback } from './fallback';
import Text from './text';

export const Root = styled.div<{ isDisabled?: boolean }>(({ isDisabled }) => ({
  position: 'absolute',
  top: '85px',
  right: '34px',
  zIndex: 230,

  borderRadius: '6px',
  boxShadow: palette.insideMap.shadow,

  display: 'flex',
  flexDirection: 'column',

  '> div + div': {
    borderTopColor: isDisabled ? palette.MapTopBar.dividerDisabled.toString() : palette.MapTopBar.divider.toString(),
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
  },

  '> div:first-child > div:first-of-type > div:first-of-type': {
    borderTopLeftRadius: '3px',
    borderTopRightRadius: '3px',
  },
  '> div:last-child > div:first-of-type > div:first-of-type': {
    borderBottomLeftRadius: '3px',
    borderBottomRightRadius: '3px',
  },

  [MediaQuery.MOBILE_L]: {
    display: 'none',
  },
}));

export const ToolWrapper = styled.div<{ isClicked?: boolean; isDisabled?: boolean }>(({ isClicked, isDisabled }) => ({
  width: '32px',
  height: '32px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  cursor: isDisabled ? 'default' : 'pointer',

  backgroundColor: (isDisabled ? palette.MapTopBar.backgroundDisabled.toString() : isClicked ? palette.white : palette.insideMap.gray).toString(),
  backdropFilter: 'blur(10px)',

  '&:hover': {
    backgroundColor: (isDisabled ? '' : isClicked ? palette.white : palette.insideMap.hoverGray).toString(),
  },
  '> svg > path': {
    fill: isDisabled ? palette.MapTopBar.iconDisabled.toString() : undefined,
  },
}));

const TooltipWrapperStyle: CSSObject = {
  position: 'relative',
};
const TooltipTargetStyle: CSSObject = {
  width: '100%',
  height: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};
const TooltipBalloonStyle: CSSObject = {
  left: 'auto',
  right: '34px',
  bottom: '3px',
};

const TooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: TooltipWrapperStyle,
  tooltipTargetStyle: TooltipTargetStyle,
  tooltipBalloonStyle: TooltipBalloonStyle,
};

export const toolSVG: { [K in keyof typeof T.TwoDDisplayMode]: ReactNode } = {
  [T.TwoDDisplayMode.NORMAL]: <DefaultSvg />,
  [T.TwoDDisplayMode.COMPARISON2]: <TwoSplitSvg />,
  [T.TwoDDisplayMode.COMPARISON4]: <FourSplitSvg />,
  [T.TwoDDisplayMode.SLIDER]: <SliderSvg />,
};

const MapViewBar: FC = () => {
  const dispatch: Dispatch<RootAction> = useDispatch();
  const {
    Pages: { Contents: {
      showSidebar: isSidebarOpened,
      twoDDisplayMode: displayMode,
      printingContentId,
      in3D,
      sidebarTab,
    } },
  }: T.State
    = useSelector((state: T.State) => state, shallowEqual);
  const isBlueprintAligning: boolean = useSelector((s: T.State) => {
    const editingContentId: T.Content['id'] | undefined = s.Pages.Contents.editingContentId;
    const aligningBlueprintId: T.BlueprintPDFContent['id'] | undefined = s.Pages.Contents.aligningBlueprintId;

    return editingContentId !== undefined &&
      s.Contents.contents.byId[editingContentId].type === T.ContentType.BLUEPRINT_PDF &&
      aligningBlueprintId === editingContentId;
  });

  const [l10n]: UseL10n = useL10n();
  const [windowX]: UseWindowSize = useWindowSize();

  const isDisabled: boolean = printingContentId !== undefined || sidebarTab === T.ContentPageTabType.PHOTO;

  const handleKeyDown: (e: KeyboardEvent) => void = useCallback((event) => {
    if (T.TwoDDisplayMode.NORMAL !== displayMode && event.key === 'Escape') {
      batch(() => {
        dispatch(ChangeTwoDDisplayMode({ twoDDisplayMode: T.TwoDDisplayMode.NORMAL }));
        dispatch(ChangeSidebarStatus({ open: true }));
      });
    }
  }, [displayMode]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isSidebarOpened && windowX <= DeviceWidth.TABLET && displayMode !== T.TwoDDisplayMode.NORMAL) {
      dispatch(ChangeTwoDDisplayMode({ twoDDisplayMode: T.TwoDDisplayMode.NORMAL }));
    }
  }, [isSidebarOpened]);

  const handleToolClick: (toolDisplayMode: T.TwoDDisplayMode) => void = (toolDisplayMode) => {
    if (!isDisabled && displayMode !== toolDisplayMode) {
      dispatch(ChangeTwoDDisplayMode({ twoDDisplayMode: toolDisplayMode }));
      dispatch(ChangeSidebarStatus({ open: toolDisplayMode === T.TwoDDisplayMode.NORMAL }));
    }
  };

  const typeToButton: (type: T.TwoDDisplayMode, index: number) => ReactNode = (type, index) => {
    const isClicked: boolean = displayMode === type;
    const isDisabledOnView: boolean = isDisabled && type !== T.TwoDDisplayMode.NORMAL;

    const onClick: () => void = () => handleToolClick(type);

    return (
      <WrapperHoverable
        key={index}
        title={l10n(Text[type])}
        customStyle={TooltipCustomStyle}
      >
        <ToolWrapper
          data-testid='tool-button'
          data-ddm-track-action='map-view'
          data-ddm-track-label={`btn-2d-view-${type.toLowerCase()}`}
          onClick={onClick}
          isClicked={isClicked}
          isDisabled={isDisabledOnView}
        >
          {toolSVG[type]}
        </ToolWrapper>
      </WrapperHoverable>
    );
  };

  const toolList: ReactNode = [
    T.TwoDDisplayMode.NORMAL,
    T.TwoDDisplayMode.COMPARISON2,
    T.TwoDDisplayMode.COMPARISON4,
    T.TwoDDisplayMode.SLIDER,
  ].map(typeToButton);

  return (() => {
    if (in3D || isBlueprintAligning) return null;

    return (
      <Root
        isDisabled={Boolean(printingContentId)}
        data-testid='tool-button-wrapper'
        className={CANCELLABLE_CLASS_NAME}
      >
        {toolList}
      </Root>
    );
  })();
};

export default memo(withErrorBoundary(MapViewBar)(Fallback));
