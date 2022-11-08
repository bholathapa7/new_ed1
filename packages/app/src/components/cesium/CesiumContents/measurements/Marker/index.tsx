import {
  Cartesian3,
  Entity,
} from 'cesium';
import React, { FC, memo, useContext, useEffect, useMemo, useState } from 'react';

import { IMarkerBehavior } from '^/components/cesium/CesiumBehaviors/marker';
import { CesiumContext, CesiumContextProps } from '^/components/cesium/CesiumContext';
import { getMarkerLocationInLonLat } from '^/components/cesium/CesiumHooks';
import { makeTextEliipsis } from '^/components/cesium/styles';
import { UseState, useProjectCoordinateSystem } from '^/hooks';
import { useContent } from '^/hooks/useContent';
import * as T from '^/types';
import { withFeatureToggle } from '^/utilities/withFeatureToggle';
import { makeCesiumId, makeCesiumType } from '../../../cesium-util';
import { createCesiumLabelOptions, createCesiumMarkerOptions } from '../../../styles';
import { CesiumContentProps } from '../../PropTypes/props';

type Props = CesiumContentProps<T.MarkerContent, IMarkerBehavior>;

const RawCesiumMarker: FC<Props> = memo(({ contentId, behavior }) => {
  const { interaction, viewer }: CesiumContextProps = useContext(CesiumContext);
  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();

  const isViewerDefined: boolean = Boolean(viewer);
  const marker: T.MarkerContent | undefined = useContent(contentId, (prev, next) => (
    prev?.title === next?.title &&
      prev?.info.location.toString() === next?.info.location.toString() &&
      prev?.color.toString() === next?.color.toString()
  ));
  const title: string = useMemo(() => marker?.title !== undefined ? makeTextEliipsis(marker?.title) : '', [marker?.title]);
  const [entity, setEntity]: UseState<Entity | undefined> = useState();

  // The entity is only created once
  // regardless of whether the marker is updated or not.
  // This is to avoid re-render and blinking on the UI
  // when the content is updated.
  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed() || !marker) return;
    const [lon, lat]: T.GeoPoint = getMarkerLocationInLonLat(marker?.info.location, projectProjection);

    const billboardEntity: Entity = viewer.entities.add({
      id: makeCesiumId(contentId),
      name: makeCesiumType(marker.type),
      label: createCesiumLabelOptions({ text: title }),
      properties: marker.color,
      position: Cartesian3.fromDegrees(lon, lat),
      billboard: createCesiumMarkerOptions({ color: marker.color }),

      // When a marker is created on the fly in 3D,
      // as opposed to be created initially when switching from 2D to 3D,
      // it immediately goes to the editing mode. Hide the marker instead.
      show: !interaction?.isCreating,
    });

    setEntity(billboardEntity);

    viewer.scene.requestRender();

    return () => {
      if (!viewer.isDestroyed()) {
        viewer.entities.remove(billboardEntity);
        viewer.scene.requestRender();
        setEntity(undefined);
      }
    };
  }, [isViewerDefined, marker !== undefined]);

  behavior.titleChange(marker);
  behavior.colorChange(marker);
  behavior.toggleSelected(marker, entity);
  behavior.pinpointer(marker);

  return (<></>);
});

export const CesiumMarker = withFeatureToggle<Props>(T.Feature.DDM)(RawCesiumMarker);
