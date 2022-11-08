/* eslint-disable no-magic-numbers */
import { AtPixelOptions } from 'ol/PluggableMap';

import { isMobile } from '^/utilities/device';

export enum OlCustomPropertyNames {
  IS_MAKRER_READY_TO_TRANSLATE = '__IS_MAKRER_READY_TO_TRANSLATE',
  TITLE = '__title',
  MAIN_FEATURE = '__main',
  PHOTO_FEATURE = '__photo',
  COLOR = '__color',
  GEOMETRY_TYPE = '__geometry-type',
  VECTOR_ONCHANGE = '__vector-onchange-',
  WHITE_PLAIN = '__white-plain-',
  PLUS = '__plus-',
  LAST_COORDINATE_CHECK_ICON = '__last-coordinate-check-icon',
  FIRST_COORDINATE_CHECK_ICON = '__first-coordinate-check-icon',
  LENGTH_SEGMENT = '__length-segment-',
  ELEVATION = '__elevation',
  IS_DESIGN_DXF = '__is_design_dxf',
  PRINT_POINT = '__print-point-',
  PRINT_ROTATE_POINT = '__print-rotate',
  PRINT_RECT = '__print-rect',
  SHOULD_KEEP_OL_MEASUREMENT_BOX_ON = '__should_keep_ol_measurement_box_on',

  OL_LENGTH_SEGMENT_SLOPE = '__ol-length-segment-slope-',
  OL_LENGTH_SEGMENT_MEASUREMENT = '__ol-length-segment-measurement-',
  OL_REALTIME_MEASUREMENT_TOOLTIP_CLASSNAME = '__ol-realtime-measurement-tooltip',
  OL_REALTIME_MEASUREMENT_TOOLTIP_LENGTH_CLASSNAME = '__ol-realtime-measurement-tooltip-length',
  OL_LOADING_TOOLTIP = '__ol-loading-tooltip',
  OL_LOADING_TOOLTIP_SMALL = '__ol-loading-tooltip-small',
  OL_HIDE_MEASUREMENT_BOX = '__ol-hide-measurement-box',
  OL_ROOT_DIV = '__ol-root-div',
  TO_BE_DELETED_POINT = '__to-be-deleted-point',

  GCP_LABEL = '__gcp-label',
  GCP_ID = '__gcp-id-',

  EXIT_EDIT = '__exit_edit',
  ENTER_EDIT = '__enter_edit',
}

export enum ListenerNames {
  POINTERMOVE = 'pointermove-listener',
  CLICK = 'click-listener',
  DRAW = 'draw-listener',
  LAYER_CHANGE = 'layerchange-listener',
  GEOMETRY_CHANGE = 'geometrychange-listener',
  GEOMETRY_CHANGE_POINTERMOVE = 'geometrychange-pointermove-listener',
  MODIFY_START = 'modifystart-listener',
  MODIFY_END = 'modifyend-listener',
  DRAW_START = 'drawstart-listener',
  DRAW_END = 'drawend-listener',
  TRANSLATE_START = 'translatestart-listener',
  TRANSLATING = 'translating-listener',
  TRANSLATE_END = 'translateend-listener',
  KEYDOWN = 'keydown-listener',
}

export enum InteractionEventTypes {
  CHANGE = 'change',
  CLICK = 'click',
  POINTER_MOVE = 'pointermove',
  DRAW_END = 'drawend',
  DRAW_START = 'drawstart',
  MODIFY_START = 'modifystart',
  MODIFY_END = 'modifyend',
  TRANSLATE_START = 'translatestart',
  TRANSLATING = 'translating',
  TRANSLATE_END = 'translateend',
  KEYDOWN = 'keydown',
}

export enum OlMinCoordinatesLength {
  LENGTH = 3,
  AREA = 4,
}

export const INTERVAL: number = 100;
export const MAX_THRESHOLD_TO_ASSUME_SAME_COORDINATE: number = 2e-9;
export const INVALID: string = 'INVALID';
export const SINGLE_LENGTH_SEGMENT_OVERLAY_OFFSET: [number, number] = [0, -40];

export const hitTolerance3px: Readonly<AtPixelOptions> = {
  hitTolerance: isMobile() ? 10 : 3,
};
export const hitTolerance10px: Readonly<AtPixelOptions> = {
  hitTolerance: isMobile() ? 20 : 10,
};
