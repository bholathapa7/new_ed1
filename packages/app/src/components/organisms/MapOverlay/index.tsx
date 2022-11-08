import React, { FC, ReactNode, memo } from 'react';
import { useSelector } from 'react-redux';

import MarkerPinpointer from '^/components/atoms/MarkerPinPointer';
import { CANCELLABLE_CLASS_NAME } from '^/components/molecules/CreatingVolumeClickEventHandler';
import LocationOverlay from '^/components/molecules/LocationOverlay';
import MapMode from '^/components/molecules/MapMode';
import MapViewBar from '^/components/molecules/MapViewBar';
import MeasurementPicker from '^/containers/molecules/MeasurementPicker';
import { useRole } from '^/hooks';
import { contentsSelector } from '^/store/duck/Contents';
import * as T from '^/types';
import { isMobile } from '^/utilities/device';
import { isRoleViewer } from '^/utilities/role-permission-check';
import { getSingleContentId } from '^/utilities/state-util';

const MapOverlay: FC = () => {
  const {
    Pages,
    Contents,
    ProjectConfigPerUser,
    Photos: { photoTab },
  }: T.State = useSelector((state: T.State) => state);
  const role: T.PermissionRole = useRole();
  const { contents } = Contents;
  const {
    Contents: {
      in3D, in3DPointCloud, printingContentId, editingContentId, aligningBlueprintId, sidebarTab, isInSourcePhotoUpload,
      currentPointCloudEngine,
    },
  } = Pages;

  const isBlueprintAligning: boolean =
    editingContentId !== undefined &&
    contents.byId[editingContentId].type === T.ContentType.BLUEPRINT_PDF &&
    aligningBlueprintId === editingContentId;

  const dsmId = getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.DSM);
  const dsmContent = contents.byId[dsmId ?? NaN];
  const isInPotree = in3DPointCloud && currentPointCloudEngine === T.PointCloudEngine.POTREE;
  const isInCesium = in3D || (in3DPointCloud && currentPointCloudEngine === T.PointCloudEngine.CESIUM);

  // Measurements rely on DSM in 3D. Do not show the measurement tools since it won't work.
  // This check can be removed once the measurements have been reimplemented to be
  // independent of DSM/terrain.
  const hideMeasurementsOnCesium = isInCesium
    && (dsmContent === undefined || contentsSelector.isProcessingOrFailedByContent(dsmContent));

  const isMeasurementPickerHidden: boolean = hideMeasurementsOnCesium || isInPotree || isBlueprintAligning || Boolean(printingContentId);

  const measurementPicker: ReactNode = isMeasurementPickerHidden ? undefined : (
    <MeasurementPicker
      data-testid='annotation-picker'
      className={CANCELLABLE_CLASS_NAME}
    />
  );

  const mapMode: ReactNode = printingContentId !== undefined ? undefined : (
    <MapMode />
  );

  const markerPinpointer: ReactNode = !isMobile() && !isRoleViewer(role) ?
    <MarkerPinpointer id={'marker-pinpointer'} location={T.MarkerPinpointerLocation.MAP} /> :
    undefined;

  return (() => {
    if (isInSourcePhotoUpload) return null;

    if (sidebarTab === T.ContentPageTabType.PHOTO) {
      if (photoTab === T.PhotoTabType.MAP) return <MapViewBar />;

      return null;
    }

    return (<>
      <LocationOverlay />
      <MapViewBar />
      {measurementPicker}
      {markerPinpointer}
      {mapMode}
    </>);
  })();
};

export default memo(MapOverlay);
