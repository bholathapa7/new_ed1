import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { ActionTypes, Actions } from './Actions';
import { OlEventListenerState, initialState } from './State';

export function reducer(state: OlEventListenerState = initialState, action: Actions): OlEventListenerState {
  switch (action.type) {
    case ActionTypes.REGISTER_CLICK_EVENT:
      return {
        ...state,
        isClickEventRegistered: true,
        currentlyModifiedLayerId: action.payload.currentlyModifiedLayerId,
      };
    case ActionTypes.DEREGISTER_CLICK_EVENT:
      return {
        ...state,
        isClickEventRegistered: true,
        currentlyModifiedLayerId: undefined,
      };
    case ActionTypes.START_DRAWING:
      return { ...state, isDrawing: true };
    case ActionTypes.END_DRAWING:
      return { ...state, isDrawing: false };
    case ActionTypes.START_MODIFYING:
      return { ...state, isModifying: true };
    case ActionTypes.END_MODIFYING:
      return { ...state, isModifying: false };
    case ActionTypes.START_HOVERING_ON_LAYER:
      return { ...state, isHoveringOnLayer: true, currentlyHoveredLayerId: action.payload.layerId };
    case ActionTypes.END_HOVERING_ON_LAYER:
      return { ...state, isHoveringOnLayer: false, currentlyHoveredLayerId: undefined };
    case ActionTypes.START_TRANSLATING:
      return { ...state, isTranslating: true };
    case ActionTypes.END_TRANSLATING:
      return { ...state, isTranslating: false };
    case ActionTypes.END_DRAWING_VOLUME:
      return { ...state, drawnVolume: action.payload };
    case ActionTypes.END_VOLUME_CREATION_PROCESS:
      return { ...state, drawnVolume: undefined };
    case ActionTypes.SELECT_LENGTH:
      return { ...state, selectedLength: action.payload };
    case ActionTypes.UPDATE_LENGTH_ELEVATIONS:
      return { ...state, selectedLengthElevations: { elevations: action.payload.elevations } };
    case ActionTypes.SHOW_LENGTH_SEGMENT_OVERLAYS:
      return { ...state, showLengthSegmentOverlays: true };
    case ActionTypes.HIDE_LENGTH_SEGMENT_OVERLAYS:
      return { ...state, showLengthSegmentOverlays: false };
    case ActionTypes.START_MODIFYING_VOLUME:
      return { ...state, isStillVolumeModifying: true };
    case ActionTypes.END_MODIFYING_VOLUME:
      return { ...state, isStillVolumeModifying: false };
    case ActionTypes.UPDATE_GEOLOCATION_POSITION:
      return { ...state, position: action.payload.position };
    case ActionTypes.UPDATE_GEOLOCATION_ACCURACY_GEOMETRY:
      return { ...state, accuracyGeometry: action.payload.accuracyGeometry };
    case ActionTypes.INITIAL_GEOLOCATION:
      return { ...state, position: undefined, accuracyGeometry: undefined };
    default:
      exhaustiveCheck(action);
  }
}
