import Color from 'color';
import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';

import AreaSvg from '^/assets/icons/contents-list/area.svg';
import LengthSvg from '^/assets/icons/contents-list/length.svg';
import MarkerSvg from '^/assets/icons/contents-list/marker.svg';
import VolumeSvg from '^/assets/icons/contents-list/volume.svg';

import AreaPinnedSvg from '^/assets/icons/contents-list/area-pinned.svg';
import LengthPinnedSvg from '^/assets/icons/contents-list/length-pinned.svg';
import MarkerPinnedSvg from '^/assets/icons/contents-list/marker-pinned.svg';
import VolumePinnedSvg from '^/assets/icons/contents-list/volume-pinned.svg';

import DesignDxfSvg from '^/assets/icons/contents-list/design-dxf.svg';
import DwgSvg from '^/assets/icons/contents-list/dwg.svg';
import DxfSvg from '^/assets/icons/contents-list/dxf.svg';
import PdfSvg from '^/assets/icons/contents-list/pdf.svg';

import ESSModelWithBgIcon from '^/assets/icons/contents-list/ess-model-with-bg.svg';
import ESSArrowToolIcon from '^/assets/icons/contents-list/ess-arrow.svg';
import ESSPolylineToolIcon from '^/assets/icons/contents-list/ess-polyline.svg';
import ESSPolygonToolIcon from '^/assets/icons/contents-list/ess-polygon.svg';
import ESSTextToolIcon from '^/assets/icons/contents-list/ess-text.svg';

import DisabledDesignDxfSvg from '^/assets/icons/contents-list/disabled-design-dxf-overlay.svg';
import DisabledDwgSvg from '^/assets/icons/contents-list/disabled-dwg-overlay.svg';
import DisabledDxfSvg from '^/assets/icons/contents-list/disabled-dxf-overlay.svg';
import DisabledPdfSvg from '^/assets/icons/contents-list/disabled-pdf-overlay.svg';

import DSMSvg from '^/assets/icons/contents-list/elevation-map.svg';
import GCPSvg from '^/assets/icons/contents-list/gcp.svg';
import MapSvg from '^/assets/icons/contents-list/map.svg';
import PointCloudSvg from '^/assets/icons/contents-list/point-clouds.svg';
import ThreeDMeshSvg from '^/assets/icons/contents-list/three-d-mesh.svg';
import ThreeDOrthoSvg from '^/assets/icons/contents-list/three-d-ortho.svg';

import * as T from '^/types';

import { UseShouldContentDisabled, useShouldContentDisabled } from '^/hooks/useShouldContentDisabled';


const Root = styled.div<{ contentColor?: string }>(({ contentColor }) => contentColor === undefined ? ({}) : ({
  ' svg path:not(.no-fill)': {
    fill: contentColor,
  },
  ' svg circle': {
    // eslint-disable-next-line no-magic-numbers
    fill: new Color(contentColor).alpha(0.25).toString(),
    // eslint-disable-next-line no-magic-numbers
    stroke: new Color(contentColor).alpha(0.25).toString(),
  },
}));

const SVGWrapper = styled.div<{ width: string; height: string }>(({ width, height }) => ({
  width,
  height,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));


/**
 * @todo change the icon
 * design_dxf, three_d_ortho, dsm
 */
const getTabToIcon: (contentType: T.ContentType, isPinned: boolean) => ReactNode = (contentType, isPinned) => {
  switch (contentType) {
    case T.ContentType.MAP:
      return <SVGWrapper width='18px' height='18px'><MapSvg /></SVGWrapper>;
    case T.ContentType.DSM:
      return <SVGWrapper width='18px' height='18px'><DSMSvg /></SVGWrapper>;
    case T.ContentType.THREE_D_ORTHO:
      return <SVGWrapper width='18px' height='18px'><ThreeDOrthoSvg /></SVGWrapper>;
    case T.ContentType.POINTCLOUD:
      return <SVGWrapper width='18px' height='18px'><PointCloudSvg /></SVGWrapper>;
    case T.ContentType.THREE_D_MESH:
      return <SVGWrapper width='18px' height='18px'><ThreeDMeshSvg /></SVGWrapper>;
    case T.ContentType.GCP_GROUP:
      return <SVGWrapper width='18px' height='18px'><GCPSvg /></SVGWrapper>;
    case T.ContentType.BLUEPRINT_PDF:
      return <SVGWrapper width='45px' height='15px'><PdfSvg /></SVGWrapper>;
    case T.ContentType.BLUEPRINT_DXF:
      return <SVGWrapper width='44px' height='15px'><DxfSvg /></SVGWrapper>;
    case T.ContentType.BLUEPRINT_DWG:
      return <SVGWrapper width='45px' height='15px'><DwgSvg /></SVGWrapper>;
    case T.ContentType.DESIGN_DXF:
      return <SVGWrapper width='44px' height='15px'><DesignDxfSvg /></SVGWrapper>;
    case T.ContentType.MARKER:
      return (isPinned ?
        <SVGWrapper width='21px' height='23px' style={{ transform: 'translateX(-2px)' }}><MarkerPinnedSvg /></SVGWrapper> :
        <SVGWrapper width='17px' height='16px' style={{ transform: 'translateY(1px)' }}><MarkerSvg /></SVGWrapper>
      );
    case T.ContentType.LENGTH:
      return (isPinned ?
        <SVGWrapper width='21px' height='23px' style={{ transform: 'translateX(-2px)' }}><LengthPinnedSvg /></SVGWrapper> :
        <SVGWrapper width='16px' height='16px' style={{ transform: 'translateY(1px)' }}><LengthSvg /></SVGWrapper>
      );
    case T.ContentType.AREA:
      return (isPinned ?
        <SVGWrapper width='21px' height='23px' style={{ transform: 'translateX(-2px)' }}><AreaPinnedSvg /></SVGWrapper> :
        <SVGWrapper width='18px' height='16px' style={{ transform: 'translateY(1px)' }}><AreaSvg /></SVGWrapper>
      );
    case T.ContentType.VOLUME:
      return (isPinned ?
        <SVGWrapper width='21px' height='23px' style={{ transform: 'translateX(-2px)' }}><VolumePinnedSvg /></SVGWrapper> :
        <SVGWrapper width='16px' height='17px' style={{ transform: 'translateY(1px)' }}><VolumeSvg /></SVGWrapper>
      );
    case T.ContentType.ESS_MODEL:
      return <SVGWrapper width='21px' height='12px' style={{ transform: 'translateY(1px)' }}><ESSModelWithBgIcon /></SVGWrapper>;
    case T.ContentType.ESS_ARROW:
      return <SVGWrapper width='21px' height='12px' style={{ transform: 'translate(2px, 1px)' }}><ESSArrowToolIcon /></SVGWrapper>;
    case T.ContentType.ESS_POLYGON:
      return <SVGWrapper width='21px' height='12px' style={{ transform: 'translate(2px, 1px)' }}><ESSPolygonToolIcon /></SVGWrapper>;
    case T.ContentType.ESS_POLYLINE:
      return <SVGWrapper width='21px' height='12px' style={{ transform: 'translate(2px, 1px)' }}><ESSPolylineToolIcon /></SVGWrapper>;
    case T.ContentType.ESS_TEXT:
      return <SVGWrapper width='21px' height='12px' style={{ transform: 'translate(2px, 1px)' }}><ESSTextToolIcon /></SVGWrapper>;
    default:
      return null;
  }
};

const DisabledTabToIcon: FC<{ contentType: T.OverLayContent['type'] }> = ({ contentType }) => {
  switch (contentType) {
    case T.ContentType.BLUEPRINT_DXF:
      return <SVGWrapper width='44px' height='15px'><DisabledDxfSvg /></SVGWrapper>;
    case T.ContentType.BLUEPRINT_DWG:
      return <SVGWrapper width='45px' height='15px'><DisabledDwgSvg /></SVGWrapper>;
    case T.ContentType.BLUEPRINT_PDF:
      return <SVGWrapper width='44px' height='15px'><DisabledPdfSvg /></SVGWrapper>;
    case T.ContentType.DESIGN_DXF:
      return <SVGWrapper width='44px' height='15px'><DisabledDesignDxfSvg /></SVGWrapper>;
    default:
      return null;
  }
};

export interface Props {
  className?: string;
  contentType: T.ContentType;
  color?: string;
  isPinned?: boolean;
}

export const ContentIcon: FC<Props> = ({ className, contentType, color, isPinned = false }) => {
  const tabIcon: ReactNode = getTabToIcon(contentType, isPinned);
  const ShouldContentDisabled: UseShouldContentDisabled = useShouldContentDisabled(contentType);
  const contentIcon: ReactNode = ShouldContentDisabled ? <DisabledTabToIcon contentType={contentType as T.OverLayContent['type']} /> : tabIcon;

  return (<Root className={className} contentColor={color}>{contentIcon}</Root>);
};
