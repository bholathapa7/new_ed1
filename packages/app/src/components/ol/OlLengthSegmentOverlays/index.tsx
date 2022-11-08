import _ from 'lodash-es';
import OlMap from 'ol/Map';
import React, { Dispatch as LocalDispatch, FC, ReactNode, useMemo } from 'react';
import { Actions } from '../OlMapEventListeners/store/Actions';
import { OlEventListenerState } from '../OlMapEventListeners/store/State';
import { LengthSegmentsOverlayOnDraw } from './LengthCoordinateElevationOnDraw';
import { LengthSegmentOverlaysOnHover } from './LengthCoordinateElevationOnHover';

export const LengthSegmentsOverlay: FC<{
  olMap: OlMap;
  olEventListenerState: OlEventListenerState;
  localDispatch: LocalDispatch<Actions>;
}> = ({
  olMap,
  olEventListenerState,
  localDispatch,
}) => {
  const {
    selectedLength, selectedLengthElevations, isDrawing,
    isHoveringOnLayer, showLengthSegmentOverlays, currentlyHoveredLayerId,
  }: OlEventListenerState = olEventListenerState;

  const lengthSegments: ReactNode = useMemo(() => (() => {
    if (!showLengthSegmentOverlays) return <></>;
    if (isDrawing) {
      return (
        <LengthSegmentsOverlayOnDraw
          {...{ olMap, selectedLength }}
        />
      );
    } else if (isHoveringOnLayer) {
      return (
        <LengthSegmentOverlaysOnHover
          {...{ olMap, selectedLength, isHoveringOnLayer, currentlyHoveredLayerId, selectedLengthElevations, localDispatch }}
        />
      );
    }

    return <></>;
  })(), [selectedLength, isHoveringOnLayer, showLengthSegmentOverlays, isDrawing, selectedLengthElevations, currentlyHoveredLayerId]);

  return (
    <>{lengthSegments}</>
  );
};
