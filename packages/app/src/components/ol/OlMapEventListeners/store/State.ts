import { PostContentArguments } from '^/store/duck/Contents';
import { Coordinate } from 'ol/coordinate';

import * as T from '^/types';
import { Polygon } from 'ol/geom';

export interface OlEventListenerState {
  isDrawing: boolean;
  showLengthSegmentOverlays: boolean;
  isClickEventRegistered: boolean;
  isModifying: boolean;
  isTranslating: boolean;
  isHoveringOnLayer: boolean;
  currentlyHoveredLayerId?: number;
  /**
   * We use this to track which layer is being modified.
   * Used for pointermove and modify.
   */
  currentlyModifiedLayerId?: number;
  /**
   * This will be defined after volume has been drawn
   */
  drawnVolume?: Pick<T.VolumeContent, PostContentArguments>;
  selectedLength?: { coordinates: Array<Coordinate> };
  selectedLengthElevations: { elevations: Array<number> };
  /**
   * This will monitor VC observable
   */
  isStillVolumeModifying: boolean;

  position?: Coordinate;
  accuracyGeometry?: Polygon;
}

export const initialState: OlEventListenerState = {
  isDrawing: false,
  showLengthSegmentOverlays: false,
  isModifying: false,
  isTranslating: false,
  isHoveringOnLayer: false,
  currentlyHoveredLayerId: undefined,
  currentlyModifiedLayerId: undefined,
  isClickEventRegistered: false,
  drawnVolume: undefined,
  selectedLength: undefined,
  selectedLengthElevations: { elevations: [] },
  isStillVolumeModifying: false,
  position: undefined,
  accuracyGeometry: undefined,
};
