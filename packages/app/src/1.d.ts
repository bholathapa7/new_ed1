/**
 * File name is for loading order.
 */

declare module 'react-day-picker/DayPickerInput' {
  import { DayPickerInput } from 'react-day-picker/types/DayPickerInput';
  export * from 'react-day-picker/types/props';
  export default DayPickerInput;
}

/**
 * Openlayers types
 */
declare module 'ol/types' {
  import ol from 'ol';
  export default ol;
}

declare module 'dxf-writer' {
  export type ThreeDCoordinates = [number, number, number];
  export default class Drawing {
    public static ACI: any;
    public addLineType(LTYPE: string, b: string, c: Array<any>): void;
    public addLayer(layerName: string, color: any, LTYPE: string): void;
    public setActiveLayer(layerName: string): void;
    public drawPolyline3d(coordinates: Array<[number, number, number]>): void;
    public drawPolyline(coordinates: Array<[number, number]>): void;
    public toDxfString(): string;
  }
}
