declare module '@angelsw/cesium-navigation-es6' {
  import { Viewer } from 'cesium';
  export interface Options {
    defaultResetView: any;
    enableCompass: boolean;
    enableZoomControls: boolean;
    enableDistanceLegend: boolean;
    enableCompassOuterRing: boolean;
  }
  export default function(viewer: Viewer, options?: Options): void;
}