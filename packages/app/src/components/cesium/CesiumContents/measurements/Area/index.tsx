import { Entity } from 'cesium';
import _ from 'lodash-es';
import React, { FC, useContext, useEffect, useState } from 'react';

import { CesiumContext, CesiumContextProps } from '^/components/cesium/CesiumContext';
import { deleteEdgesOf } from '^/components/cesium/CesiumHooks';
import { useLengthAreaVolumeContent } from '^/components/cesium/CesiumHooks/useLengthAreaVolumeContent';
import { UseState } from '^/hooks';
import * as T from '^/types';
import { IGeometryBehavior } from '../../../CesiumBehaviors/contents';
import {
  getTitlePosition, makeCesiumId, makeCesiumType,
} from '../../../cesium-util';
import { createCesiumLabelOptions, createCesiumPolygonOptions, createCesiumPolylineOptions } from '../../../styles';
import { CesiumContentProps } from '../../PropTypes/props';
import { withFeatureToggle } from '^/utilities/withFeatureToggle';

type Props = CesiumContentProps<T.AreaContent, IGeometryBehavior>;

const RawCesiumArea: FC<Props> = ({ contentId, behavior }) => {
  const { viewer }: CesiumContextProps = useContext(CesiumContext);
  const isViewerDefined: boolean = Boolean(viewer);
  const area: T.AreaContent | undefined = useLengthAreaVolumeContent(contentId);
  const setEdge: () => void = behavior.setEdge(area);
  const [entity, setEntity]: UseState<Entity | undefined> = useState();

  // The entity is only created once
  // regardless of whether area is updated or not.
  // This is to avoid re-render and blinking on the UI
  // when the content is updated.
  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed() || area === undefined) return;

    const { color, title: text, info: { locations } }: T.AreaContent = area;
    const areaEntity: Entity = viewer.entities.add({
      id: makeCesiumId(contentId),
      name: makeCesiumType(area.type),
      label: createCesiumLabelOptions({ text }),
      position: getTitlePosition(locations),
      polyline: createCesiumPolylineOptions({ color, locations }),
      polygon: createCesiumPolygonOptions({ color, locations }),
    });

    setEntity(areaEntity);
    setEdge();

    viewer.scene.requestRender();

    return () => {
      if (viewer.isDestroyed()) return;
      deleteEdgesOf(contentId, viewer);

      viewer.entities.remove(areaEntity);
      viewer.scene.requestRender();

      setEntity(undefined);
    };
  }, [isViewerDefined, area !== undefined]);

  behavior.titleChange(area);
  behavior.colorChange(area);
  behavior.setLocations(area, entity);

  return (<></>);
};

export const CesiumArea = withFeatureToggle<Props>(T.Feature.DDM)(RawCesiumArea);
