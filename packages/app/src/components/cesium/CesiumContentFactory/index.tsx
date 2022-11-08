import React, { FC, memo } from 'react';
import { useSelector } from 'react-redux';

import { contentSelector } from '^/hooks/useContent';
import * as T from '^/types';
import { GeometryBehavior } from '../CesiumBehaviors/contents';
import { ModelBehavior } from '../CesiumBehaviors/ess/model';
import { TextBehavior } from '../CesiumBehaviors/ess/text';
import { MarkerBehavior } from '../CesiumBehaviors/marker';
import { OverlayBehavior } from '../CesiumBehaviors/overlays';
import { CesiumESSModel } from '../CesiumContents/ess/Model';
import { CesiumESSPolyline } from '../CesiumContents/ess/Polyline';
import { CesiumESSText } from '../CesiumContents/ess/Text';
import { Cesium3DMesh } from '../CesiumContents/maps/ThreeDMesh';
import { CesiumPointCloud } from '../CesiumContents/maps/PointCloud';
import { CesiumArea } from '../CesiumContents/measurements/Area';
import { CesiumLength } from '../CesiumContents/measurements/Length';
import { CesiumMarker } from '../CesiumContents/measurements/Marker';
import { CesiumVolume } from '../CesiumContents/measurements/Volume';
import { CesiumBlueprint } from '../CesiumContents/overlays/Blueprint';
import { CesiumDesignDXF } from '../CesiumContents/overlays/DesignDXF';

interface Props {
  readonly contentId: (T.MeasurementContent | T.OverLayContent)['id'];
}

export const CesiumContentFactory: FC<Props> = memo(({ contentId }) => {
  const contentType: T.ContentType | undefined = useSelector((s: T.State) => contentSelector(s, contentId)?.type);
  const shouldShow: Date | undefined = useSelector((s: T.State) => contentSelector(s, contentId)?.config?.selectedAt);

  if (!shouldShow) return null;
  switch (contentType) {
    case T.ContentType.MARKER:
      return (<CesiumMarker
        key={`__cesium-marker-${contentId}`}
        contentId={contentId}
        behavior={MarkerBehavior}
      />);

    case T.ContentType.LENGTH:
      return (<CesiumLength
        key={`__cesium-length-${contentId}`}
        contentId={contentId}
        behavior={GeometryBehavior}
      />);

    case T.ContentType.AREA:
      return (<CesiumArea
        key={`__cesium-area-${contentId}`}
        contentId={contentId}
        behavior={GeometryBehavior}
      />);

    case T.ContentType.VOLUME:
      return (<CesiumVolume
        key={`__cesium-volume-${contentId}`}
        contentId={contentId}
        behavior={GeometryBehavior}
      />);

    case T.ContentType.DESIGN_DXF:
      return (<CesiumDesignDXF
        key={`__cesium-design-dxf-${contentId}`}
        contentId={contentId}
        behavior={OverlayBehavior}
      />);

    case T.ContentType.BLUEPRINT_DXF:
    case T.ContentType.BLUEPRINT_DWG:
      return (<CesiumBlueprint
        key={`__cesium-blueprint-${contentId}`}
        contentId={contentId}
        behavior={OverlayBehavior}
      />);

    case T.ContentType.BLUEPRINT_PDF:
      return null;

    case T.ContentType.THREE_D_MESH:
      return <Cesium3DMesh key={`__cesium-3d-mesh-${contentId}`} contentId={contentId} />;

    case T.ContentType.POINTCLOUD:
      return (<CesiumPointCloud
        key={`__cesium-pointcloud-${contentId}`}
        contentId={contentId}
      />);

    case T.ContentType.ESS_MODEL:
      return (<CesiumESSModel
        key={`__cesium-ess-model-${contentId}`}
        contentId={contentId}
        behavior={ModelBehavior}
      />);
    case T.ContentType.ESS_ARROW:
    case T.ContentType.ESS_POLYGON:
    case T.ContentType.ESS_POLYLINE:
      return (<CesiumESSPolyline
        key={`__cesium-ess-polyline-${contentId}`}
        contentId={contentId}
        behavior={GeometryBehavior}
      />);

    case T.ContentType.ESS_TEXT:
      return (<CesiumESSText
        key={`__cesium-ess-text-${contentId}`}
        contentId={contentId}
        behavior={TextBehavior}
      />);

    default:
      return null;
  }
});
