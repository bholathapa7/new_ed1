import { Entity } from 'cesium';

import * as T from '^/types';
import { useEntityColorChange, useEntityTitleChange, useMarkerToggleSelected, usePinpointer } from '../../CesiumHooks';

export interface IMarkerBehavior {
  titleChange(content?: T.MarkerContent): void;
  colorChange(content?: T.MarkerContent): void;
  pinpointer(content?: T.MarkerContent): void;
  toggleSelected(content?: T.MeasurementContent, entity?: Entity): void;
}

export const MarkerBehavior: IMarkerBehavior = {
  titleChange: useEntityTitleChange,
  colorChange: useEntityColorChange,
  pinpointer: usePinpointer,
  toggleSelected: useMarkerToggleSelected,
};
