import { PostContentArguments } from '^/store/duck/Contents';
import * as T from '^/types';
import { Coordinate } from 'ol/coordinate';
import { Polygon } from 'ol/geom';

export enum ActionTypes {
  REGISTER_CLICK_EVENT = 'REGISTER_CLICK_EVENT',
  DEREGISTER_CLICK_EVENT = 'DEREGISTER_CLICK_EVENT',
  START_MODIFYING = 'START_MODIFYING',
  END_MODIFYING = 'END_MODIFYING',
  START_TRANSLATING = 'START_TRANSLATING',
  END_TRANSLATING = 'END_TRANSLATING',
  START_DRAWING = 'START_DRAWING',
  END_DRAWING = 'END_DRAWING',
  START_HOVERING_ON_LAYER = 'START_HOVERING_ON_LAYER',
  END_HOVERING_ON_LAYER = 'END_HOVERING_ON_LAYER',
  END_DRAWING_VOLUME = 'END_DRAWING_VOLUME',
  END_VOLUME_CREATION_PROCESS = 'END_VOLUME_CREATION_PROCESS',
  SELECT_LENGTH = 'SELECT_LENGTH',
  UPDATE_LENGTH_ELEVATIONS = 'UPDATE_LENGTH_ELEVATIONS',
  SHOW_LENGTH_SEGMENT_OVERLAYS = 'SHOW_LENGTH_SEGMENT_OVERLAYS',
  HIDE_LENGTH_SEGMENT_OVERLAYS = 'HIDE_LENGTH_SEGMENT_OVERLAYS',
  START_MODIFYING_VOLUME = 'START_MODIFYING_VOLUME',
  END_MODIFYING_VOLUME = 'END_MODIFYING_VOLUME',
  UPDATE_GEOLOCATION_POSITION = 'UPDATE_GEOLOCATION_POSITION',
  UPDATE_GEOLOCATION_ACCURACY_GEOMETRY = 'UPDATE_GEOLOCATION_ACCURACY_GEOMETRY',
  INITIAL_GEOLOCATION = 'INITIAL_GEOLOCATION',
}

export interface RegisterClickEvent {
  type: ActionTypes.REGISTER_CLICK_EVENT;
  payload: {
    currentlyModifiedLayerId?: number;
  };
}

export interface DeRegisterClickEvent {
  type: ActionTypes.DEREGISTER_CLICK_EVENT;
}

export interface StartDrawing {
  type: ActionTypes.START_DRAWING;
}
export interface EndDrawing {
  type: ActionTypes.END_DRAWING;
}

export interface StartTranslating {
  type: ActionTypes.START_TRANSLATING;
}
export interface EndTranslating {
  type: ActionTypes.END_TRANSLATING;
}

export interface StartModifying {
  type: ActionTypes.START_MODIFYING;
}

export interface EndModifying {
  type: ActionTypes.END_MODIFYING;
}
export interface StartHoveringOnLayer {
  type: ActionTypes.START_HOVERING_ON_LAYER;
  payload: { layerId: number };
}
export interface EndHoveringOnLayer {
  type: ActionTypes.END_HOVERING_ON_LAYER;
}

export interface EndDrawingVolume {
  type: ActionTypes.END_DRAWING_VOLUME;
  payload: Pick<T.VolumeContent, PostContentArguments>;
}

export interface EndVolumeCreationProcess {
  type: ActionTypes.END_VOLUME_CREATION_PROCESS;
}
export interface ShowLengthSegmentOverlays {
  type: ActionTypes.SHOW_LENGTH_SEGMENT_OVERLAYS;
}
export interface HideLengthSegmentOverlays {
  type: ActionTypes.HIDE_LENGTH_SEGMENT_OVERLAYS;
}

export interface DrawLength {
  type: ActionTypes.SELECT_LENGTH;
  payload?: {
    coordinates: Array<Coordinate>;
  };
}

export interface UpdateLengthElevations {
  type: ActionTypes.UPDATE_LENGTH_ELEVATIONS;
  payload: {
    elevations: Array<number>;
  };
}

export interface StartModifyingVolume {
  type: ActionTypes.START_MODIFYING_VOLUME;
}

export interface EndModifyingVolume {
  type: ActionTypes.END_MODIFYING_VOLUME;
}

export interface UpdateGeolocationPosition {
  type: ActionTypes.UPDATE_GEOLOCATION_POSITION;
  payload: { position: Coordinate };
}

export interface UpdateGeolocationAccuracyGeometry {
  type: ActionTypes.UPDATE_GEOLOCATION_ACCURACY_GEOMETRY;
  payload: { accuracyGeometry: Polygon };
}

export interface InitialGeolocation {
  type: ActionTypes.INITIAL_GEOLOCATION;
}

export type Actions =
  StartDrawing | EndDrawing | RegisterClickEvent | DeRegisterClickEvent |
  StartModifying | EndModifying | StartTranslating | EndTranslating | EndDrawingVolume |
  EndVolumeCreationProcess | DrawLength | UpdateLengthElevations | ShowLengthSegmentOverlays | HideLengthSegmentOverlays |
  StartHoveringOnLayer | EndHoveringOnLayer | StartModifyingVolume | EndModifyingVolume | UpdateGeolocationPosition |
  UpdateGeolocationAccuracyGeometry | InitialGeolocation;
