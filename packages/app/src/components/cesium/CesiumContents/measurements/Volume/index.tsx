import { Entity } from 'cesium';
import _ from 'lodash-es';
import React, { FC, useContext, useEffect, useState } from 'react';

import { CesiumContext, CesiumContextProps } from '^/components/cesium/CesiumContext';
import { deleteEdgesOf } from '^/components/cesium/CesiumHooks';
import { useLengthAreaVolumeContent } from '^/components/cesium/CesiumHooks/useLengthAreaVolumeContent';
import { UseState } from '^/hooks';
import * as T from '^/types';
import { IGeometryBehavior } from '../../../CesiumBehaviors/contents';
import { getTitlePosition, makeCesiumId, makeCesiumType } from '../../../cesium-util';
import { createCesiumLabelOptions, createCesiumPolygonOptions, createCesiumPolylineOptions } from '../../../styles';
import { CesiumContentProps } from '../../PropTypes/props';
import { withFeatureToggle } from '^/utilities/withFeatureToggle';

export const POLYGON_ON_GROUND_ALPHA: number = 0.6;

type Props = CesiumContentProps<T.VolumeContent, IGeometryBehavior>;

const RawCesiumVolume: FC<Props> = ({ contentId, behavior }) => {
  const { viewer }: CesiumContextProps = useContext(CesiumContext);
  const isViewerDefined: boolean = Boolean(viewer);
  const [entity, setEntity]: UseState<Entity | undefined> = useState();
  const volume: T.VolumeContent | undefined = useLengthAreaVolumeContent(contentId);
  const setEdge: () => void = behavior.setEdge(volume);

  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed() || volume === undefined) return;

    const { color, title: text, info: { locations } }: T.VolumeContent = volume;
    const volumeEntity: Entity = viewer.entities.add({
      id: makeCesiumId(volume.id),
      name: makeCesiumType(volume.type),
      label: createCesiumLabelOptions({ text }),
      position: getTitlePosition(locations),
      polyline: createCesiumPolylineOptions({ color, locations }),
      polygon: createCesiumPolygonOptions({ color, locations }),
    });

    setEntity(volumeEntity);
    setEdge();

    viewer.scene.requestRender();

    return () => {
      if (viewer.isDestroyed()) return;
      deleteEdgesOf(contentId, viewer);
      setEntity(undefined);

      viewer.entities.remove(volumeEntity);
      viewer.scene.requestRender();
    };
  }, [isViewerDefined, volume !== undefined]);

  behavior.titleChange(volume);
  behavior.colorChange(volume);
  behavior.setLocations(volume, entity);

  return (<></>);
};

export const CesiumVolume = withFeatureToggle<Props>(T.Feature.DDM)(RawCesiumVolume);
