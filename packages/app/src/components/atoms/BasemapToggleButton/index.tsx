import React, { FC, memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled, { CSSObject } from 'styled-components';

import BaseMapThumbnail from '^/assets/icons/map-mode/base-map-thumbnail.png';

import * as T from '^/types';
import Text from './text';

import palette from '^/constants/palette';

import WrapperHoverable, { Props as WrapperHoverableProps } from '^/components/atoms/WrapperHoverable';

import { UseL10n, useL10n } from '^/hooks';
import { PatchProjectConfig } from '^/store/duck/ProjectConfig';

export const Root = styled.div({
  position: 'absolute',
  left: 0,
  bottom: '36px',

  width: '58px',
  height: '58px',

  border: `solid thin ${palette.white.toString()}`,
  borderRadius: '4.5px',

  boxShadow: palette.insideMap.shadow,

  backgroundColor: palette.white.toString(),

  cursor: 'pointer',
});

const TooltipTargetStyle: CSSObject = {
  display: 'block',
};
const TooltipArrowStyle: CSSObject = {
  left: '42px',
};
const TooltipBalloonStyle: CSSObject = {
  left: '-10px',
  bottom: '10px',
};
const TooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipTargetStyle: TooltipTargetStyle,
  tooltipArrowStyle: TooltipArrowStyle,
  tooltipBalloonStyle: TooltipBalloonStyle,
};

interface ThumbnailProps {
  isMapShown?: boolean;
}
export const Thumbnail = styled.div<ThumbnailProps>(({ isMapShown }) => ({
  width: '100%',
  height: '100%',
  backgroundImage: isMapShown ? undefined : `url(${BaseMapThumbnail})`,
  backgroundPosition: 'center',
  backgroundSize: '61px 61px',
  backgroundColor:
    (isMapShown ? palette.baseMapToggleButtonGray : palette.transparent).toString(),
  borderRadius: '3.5px',
}));

const BaseMapToggleButton: FC = () => {
  const dispatch: Dispatch = useDispatch();

  const isMapShown: boolean = useSelector((state: T.State) => Boolean(state.ProjectConfigPerUser.config?.isMapShown));
  const projectId: T.Project['id'] | undefined = useSelector((state: T.State) => state.Pages.Contents.projectId);
  const isIn3DPointCloud: boolean = useSelector((state: T.State) => state.Pages.Contents.in3DPointCloud);
  const isIn3D: boolean = useSelector((state: T.State) => state.Pages.Contents.in3D);

  const [l10n]: UseL10n = useL10n();

  const onClick: () => void = useCallback(() => {
    if (projectId === undefined) return;

    dispatch(PatchProjectConfig({
      projectId,
      config: {
        isMapShown: !isMapShown,
      },
    }));
  }, [projectId, isMapShown]);

  const baseMapToggleText: 'none' | 'map' = isMapShown ? 'none' : 'map';

  return !isIn3DPointCloud ? (
    <WrapperHoverable
      title={l10n(Text.satellite[baseMapToggleText])}
      customStyle={TooltipCustomStyle}
    >
      <Root
        data-ddm-track-action='map-view'
        data-ddm-track-label={`btn-toggle-basemap-${baseMapToggleText}-${isIn3D ? '3d' : '2d'}`}
        onClick={onClick}
        data-testid='basemap-toggle-button'
      >
        <Thumbnail isMapShown={isMapShown} />
      </Root>
    </WrapperHoverable>
  ) : null;
};

export default memo(BaseMapToggleButton);
