import {
  Camera,
  ClockViewModel,
  DataSourceCollection,
  Globe,
  ImageryLayerCollection,
  ImageryProvider,
  MapMode2D,
  MapProjection,
  ProviderViewModel,
  Scene,
  SceneMode,
  ShadowMode,
  SkyAtmosphere,
  SkyBox,
  TerrainProvider,
  Viewer as CesiumViewer,
} from 'cesium';

import {
  Camera as MockCamera,
  ImageryLayerCollection as MockImageryLayerCollection,
  Scene as MockScene,
} from '.';

export class Viewer implements Partial<CesiumViewer> {
  public camera: Camera = new MockCamera(new MockScene()) as Camera;
  public scene: Scene = new MockScene() as unknown as Scene;
  public imageryLayers: ImageryLayerCollection =
    new MockImageryLayerCollection() as ImageryLayerCollection;
  public constructor(_container: Element | string, _options?: {
    animation?: boolean;
    baseLayerPicker?: boolean;
    fullscreenButton?: boolean;
    vrButton?: boolean;
    geocoder?: boolean;
    homeButton?: boolean;
    infoBox?: boolean;
    sceneModePicker?: boolean;
    selectionIndicator?: boolean;
    timeline?: boolean;
    navigationHelpButton?: boolean;
    navigationInstructionsInitiallyVisible?: boolean;
    scene3DOnly?: boolean;
    shouldAnimate?: boolean;
    clockViewModel?: ClockViewModel;
    selectedImageryProviderViewModel?: ProviderViewModel;
    imageryProviderViewModels?: Array<ProviderViewModel>;
    selectedTerrainProviderViewModel?: ProviderViewModel;
    terrainProviderViewModels?: Array<ProviderViewModel>;
    imageryProvider?: ImageryProvider | false;
    terrainProvider?: TerrainProvider;
    skyBox?: SkyBox | false;
    skyAtmosphere?: SkyAtmosphere | false;
    fullscreenElement?: Element | string;
    useDefaultRenderLoop?: boolean;
    targetFrameRate?: number;
    showRenderLoopErrors?: boolean;
    automaticallyTrackDataSourceClocks?: boolean;
    contextOptions?: any;
    sceneMode?: SceneMode;
    mapProjection?: MapProjection;
    globe?: Globe | false;
    orderIndependentTranslucency?: boolean;
    creditContainer?: Element | string;
    creditViewport?: Element | string;
    dataSources?: DataSourceCollection;
    terrainExaggeration?: number;
    shadows?: boolean;
    terrainShadows?: ShadowMode;
    mapMode2D?: MapMode2D;
    projectionPicker?: boolean;
    requestRenderMode?: boolean;
    maximumRenderTimeChange?: number;
  }) {}
  public destroy(): void {}
}
