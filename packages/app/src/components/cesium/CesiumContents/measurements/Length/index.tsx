import { Entity } from 'cesium';
import { FC, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { deleteEdgesOf } from '^/components/cesium/CesiumHooks';
import { useLengthAreaVolumeContent } from '^/components/cesium/CesiumHooks/useLengthAreaVolumeContent';
import { requestElevationsFromCoordinates } from '^/components/ol/OlLengthSegmentOverlays/util';
import { UseState, useAuthHeader } from '^/hooks';
import { AuthHeader } from '^/store/duck/API';
import * as T from '^/types';
import { getSingleContentId } from '^/utilities/state-util';

import { IGeometryBehavior } from '../../../CesiumBehaviors/contents';
import { CesiumContext, CesiumContextProps } from '../../../CesiumContext';
import {
  getTitlePosition,
  isContentPointToPoint,
  makeCesiumId,
  makeCesiumType,
} from '../../../cesium-util';
import { createCesiumLabelOptions, createCesiumPolylineOptions } from '../../../styles';
import { CesiumContentProps } from '../../PropTypes/props';
import { withFeatureToggle } from '^/utilities/withFeatureToggle';

type Props = CesiumContentProps<T.LengthContent, IGeometryBehavior>;

const RawCesiumLength: FC<Props> = ({ contentId, behavior }) => {
  const { viewer, interaction }: CesiumContextProps = useContext(CesiumContext);
  const length: T.LengthContent | undefined = useLengthAreaVolumeContent(contentId);
  if (length === undefined) return null;

  const setEdge: () => void = behavior.setEdge(length);
  const targetDSMId: T.DSMContent['id'] | undefined = useSelector(
    ({ Contents, Pages, ProjectConfigPerUser }: T.State) => getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.DSM)
  );
  const authHeader: AuthHeader | undefined = useAuthHeader();
  const [entity, setEntity]: UseState<Entity | undefined> = useState();

  const isPointToPoint: boolean = isContentPointToPoint(length);

  // The entity is only created once
  // regardless of whether length is updated or not.
  // This is to avoid re-render and blinking on the UI
  // when the content is updated.
  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed() || !interaction || !length) return;

    const { color, title: text, info: { locations } }: T.LengthContent = length;

    const lengthEntity: Entity = viewer.entities.add({
      position: getTitlePosition(locations),
      polyline: createCesiumPolylineOptions({ color, locations, isPointToPoint }),
      label: createCesiumLabelOptions({ text, isPointToPoint }),
      id: makeCesiumId(contentId),
      name: makeCesiumType(length.type),
    });

    // The elevation and distance data is stored
    // in the interaction instance for every entity
    // so that it can be used to show segment values when editing/hovering.
    interaction.elevations.set(contentId, new Map());
    interaction.distances.set(contentId, new Map());
    setEntity(lengthEntity);
    setEdge();

    viewer.scene.requestRender();

    return () => {
      if (viewer.isDestroyed()) return;

      deleteEdgesOf(contentId, viewer);
      viewer.entities.remove(lengthEntity);
      viewer.scene.requestRender();

      interaction.elevations.delete(contentId);
      interaction.distances.delete(contentId);
      setEntity(undefined);
    };
  }, [viewer, interaction, isPointToPoint]);

  // For every location in this length content, request the elevation value
  // and store them in the interaction instance to show them on the labels.
  useEffect(() => {
    if (!length?.info.locations || !interaction) return;

    const requestSegmentValues: () => void = async () => {
      const response: Array<T.ElevationInfo['value']> = await requestElevationsFromCoordinates({
        targetDSMId,
        coordinates: length.info.locations,
        authHeader,
      });

      response.forEach((elevation, index) => {
        interaction.elevations.get(contentId)?.set(index, elevation);
      });
    };

    requestSegmentValues();
  }, [length?.info.locations]);

  behavior.titleChange(length);
  behavior.colorChange(length);
  behavior.setLocations(length, entity);

  return null;
};

export const CesiumLength = withFeatureToggle<Props>(T.Feature.DDM)(RawCesiumLength);
