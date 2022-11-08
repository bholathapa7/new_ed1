import { PostContentArguments } from '^/store/duck/Contents';
import * as T from '^/types';

import palette from '^/constants/palette';
import { nameLanguageMapper } from '^/store/duck/ESSModels';
import { getOrderedTitle } from '^/utilities/annotation-content-util';
import { contentTexts } from '^/utilities/content-util';
import { L10nDictionary, l10n } from '^/utilities/l10n';
import { Coordinate } from 'ol/coordinate';
import { ESS_DEFAULT_FONT_SIZE_INDEX, ESS_FONT_SIZES } from './cesium';

export const DEFAULT_MEASUREMENT_TEXT: { [K in T.GeometryContent['type'] | T.ContentType.ESS_TEXT]: { [K: string]: L10nDictionary } } = {
  [T.ContentType.MARKER]: {
    title: contentTexts[T.ContentType.MARKER],
    description: {
      [T.Language.KO_KR]: '내용을 입력하세요.',
      [T.Language.EN_US]: 'Type here.',
    },
  },
  [T.ContentType.LENGTH]: {
    title: contentTexts[T.ContentType.LENGTH],
  },
  [T.ContentType.AREA]: {
    title: contentTexts[T.ContentType.AREA],
  },
  [T.ContentType.VOLUME]: {
    title: contentTexts[T.ContentType.VOLUME],
  },
  [T.ContentType.ESS_ARROW]: {
    title: contentTexts[T.ContentType.ESS_ARROW],
  },
  [T.ContentType.ESS_POLYGON]: {
    title: contentTexts[T.ContentType.ESS_POLYGON],
  },
  [T.ContentType.ESS_POLYLINE]: {
    title: contentTexts[T.ContentType.ESS_POLYLINE],
  },
  [T.ContentType.ESS_TEXT]: {
    title: contentTexts[T.ContentType.ESS_TEXT],
  },
};

export const DEFAULT_ESS_TEXT_PROMPT: Record<T.Language, string> = {
  [T.Language.EN_US]: 'Please enter a title',
  [T.Language.KO_KR]: '내용을 입력하세요',
};

export const ppu: number = 10;
export const tileScaleFactor: number = 1 / ppu;
// eslint-disable-next-line no-magic-numbers
const firstPinImagePoints: [number, number] = [0.4, 0.5];
// eslint-disable-next-line no-magic-numbers
const secondPinImagePoints: [number, number] = [0.6, 0.5];

export const ELEVATION_FIX_FORMAT: number = 2;
export const LAT_LON_FIX_FORMAT: number = 8;
export const Y_X_FIX_FORMAT: number = 3;

export const DEFAULT_OPACITY: number = 100;

interface ThreeDOption {
  pointNumber: number;
  pointSize: number;
}
export const default3DOption: ThreeDOption = {
  pointNumber: 10, // 10 millions
  pointSize: 0.7,
};

export const default2DOrthoZIndex: number = 300000;

export const defaultMapZoom: number = 16;

export interface DefaultLocationBasedContentParams {
  locations: Array<Coordinate>;
  language: T.Language;
  usingNames: Array<string>;
  targetMapContentId?: T.MapContent['id'];
}

export interface DefaultMarkerContentParams extends DefaultLocationBasedContentParams {
  location: T.GeoPoint;
}

export const createDefaultMarker: (
  params: DefaultMarkerContentParams,
) => Pick<T.MarkerContent, PostContentArguments> = ({
  location, language, usingNames, targetMapContentId,
}) => ({
  title: getOrderedTitle(l10n(DEFAULT_MEASUREMENT_TEXT.marker.title, language), usingNames),
  type: T.ContentType.MARKER,
  color: palette.measurements[T.ContentType.MARKER],
  info: {
    description: '',
    location,
    move: false,
    targetMapContentId,
  },
});

export const createDefaultLength: (
  params: DefaultLocationBasedContentParams,
) => Pick<T.LengthContent, PostContentArguments> = ({
  locations, language, usingNames,
}) => ({
  title: getOrderedTitle(l10n(DEFAULT_MEASUREMENT_TEXT.length.title, language), usingNames),
  type: T.ContentType.LENGTH,
  color: palette.measurements[T.ContentType.LENGTH],
  info: {
    value: '',
    locations,
    move: false,
  },
});

export const createDefaultESSWorkTool: (
  params: DefaultLocationBasedContentParams & { type: T.ESSLineBasedContent['type'] },
) => Pick<T.ESSLineBasedContent, PostContentArguments> = ({
  locations, language, usingNames, type,
}) => ({
  title: getOrderedTitle(l10n(DEFAULT_MEASUREMENT_TEXT[type].title, language), usingNames),
  type,
  color: palette.ESSWorkTool[type],
  info: {
    locations,
  },
});

export const createDefaultESSText: (
  params: DefaultLocationBasedContentParams,
) => Pick<T.ESSTextContent, PostContentArguments> = ({
  locations, language, usingNames,
}) => ({
  title: getOrderedTitle(l10n(DEFAULT_MEASUREMENT_TEXT[T.ContentType.ESS_TEXT].title, language), usingNames),
  type: T.ContentType.ESS_TEXT,
  color: palette.ESSWorkTool[T.ContentType.ESS_TEXT].bgColor,
  info: {
    location: locations[0],
    description: DEFAULT_ESS_TEXT_PROMPT[language],
    fontSize: ESS_FONT_SIZES[ESS_DEFAULT_FONT_SIZE_INDEX],
    fontColor: palette.ESSWorkTool[T.ContentType.ESS_TEXT].fontColor,
  },
});

export const createDefaultArea: (
  params: DefaultLocationBasedContentParams,
) => Pick<T.AreaContent, PostContentArguments> = ({
  locations, language, usingNames,
}) => ({
  title: getOrderedTitle(l10n(DEFAULT_MEASUREMENT_TEXT.area.title, language), usingNames),
  type: T.ContentType.AREA,
  color: palette.measurements[T.ContentType.AREA],
  info: {
    value: '',
    locations,
    move: false,
  },
});

export const createDefaultVolume: (
  params: DefaultLocationBasedContentParams,
) => Pick<T.VolumeContent, PostContentArguments> = ({
  locations, language, usingNames,
}) => ({
  title: getOrderedTitle(l10n(DEFAULT_MEASUREMENT_TEXT.volume.title, language), usingNames),
  type: T.ContentType.VOLUME,
  color: palette.measurements[T.ContentType.VOLUME],
  info: {
    calculatedVolume: {
      calculation: {
        type: T.VolumeCalcMethod.BASIC,
        volumeAlgorithm: T.BasicCalcBasePlane.TRIANGULATED,
        volumeElevation: 0,
      },
      cut: 0, fill: 0, total: 0,
    },
    value: '',
    locations,
  },
});

interface ESSContentExtraParams {
  readonly model: T.ESSModelInstance;
}

export const createDefaultESSModel: (
  params: DefaultLocationBasedContentParams & ESSContentExtraParams,
) => Pick<T.ESSModelContent, PostContentArguments> = ({
  locations, usingNames, language, model,
}) => {
  const titleByLanguage: T.ESSModelInstance['nameKo'] | T.ESSModelInstance['nameEn']
    = model[nameLanguageMapper[language]];

  return {
    title: getOrderedTitle(titleByLanguage, usingNames),
    type: T.ContentType.ESS_MODEL,
    color: palette.white,
    info: {
      location: locations[0],
      description: '',
      modelId: model.id,
      isWorkRadiusVisEnabled: true,
    },
  };
};

export const defaultBlueprintPDFWidth: number = 16542;
export const defaultBlueprintPDFHeight: number = 11694;
export const defaultBlueprintPDF: (params: ({
  title: T.BlueprintDXFContent['title'];
  geoPoint: [T.GeoPoint, T.GeoPoint];
})) => Pick<T.BlueprintPDFContent, PostContentArguments> = ({
  title, geoPoint,
}) => ({
  title,
  type: T.ContentType.BLUEPRINT_PDF,
  color: palette.overlays[T.ContentType.BLUEPRINT_PDF],
  info: {
    imagePoint: [
      firstPinImagePoints.map(
        /* istanbul ignore next */
        (p) => p * tileScaleFactor,
      ) as [number, number],
      secondPinImagePoints.map(
        /* istanbul ignore next */
        (p) => p * tileScaleFactor,
      ) as [number, number],
    ],
    geoPoint,
    move: false,
    dimension: {
      width: defaultBlueprintPDFWidth,
      height: defaultBlueprintPDFHeight,
    },
  },
});

export const defaultBlueprintDXF: (params: ({
  title: T.BlueprintDXFContent['title'];
  coordinateSystem: T.ProjectionEnum;
})) => Pick<T.BlueprintDXFContent, PostContentArguments> = ({
  title, coordinateSystem,
}) => ({
  title,
  type: T.ContentType.BLUEPRINT_DXF,
  color: palette.overlays[T.ContentType.BLUEPRINT_DXF],
  info: {
    opacity: 1,
    coordinateSystem,
  },
});

export const defaultBlueprintDWG: (params: ({
  title: T.BlueprintDWGContent['title'];
  coordinateSystem: T.ProjectionEnum;
})) => Pick<T.BlueprintDWGContent, PostContentArguments> = ({
  title, coordinateSystem,
}) => ({
  title,
  type: T.ContentType.BLUEPRINT_DWG,
  color: palette.overlays[T.ContentType.BLUEPRINT_DWG],
  info: {
    opacity: 1,
    coordinateSystem,
  },
});

export const defaultGroup: (params: ({
  title: T.GroupContent['title'];
})) => Pick<T.GroupContent, PostContentArguments> = ({
  title,
}) => ({
  title,
  type: T.ContentType.GROUP,
  color: palette.white,
  info: {
    isOpened: false,
  },
});

export type DefaultDesignDXF = Pick<Overwrite<T.DesignDXFContent, {
  info: Omit<T.DesignDXFContent['info'], 'designBorder'>;
}>, PostContentArguments>;

export const defaultDesignDXF: (params: ({
  title: T.DesignDXFContent['title'];
  coordinateSystem: T.ProjectionEnum;
})) => DefaultDesignDXF = ({
  title, coordinateSystem,
}) => ({
  title,
  type: T.ContentType.DESIGN_DXF,
  color: palette.overlays[T.ContentType.DESIGN_DXF],
  info: {
    opacity: 100,
    coordinateSystem,
  },
});

export const defaultMap: () => Pick<T.MapContent, PostContentArguments> = () => ({
  title: '',
  type: T.ContentType.MAP,
  color: palette.mapColor,
  info: {},
});

export type DefaultDSM = Pick<Overwrite<T.DSMContent, {
  info: {};
}>, PostContentArguments>;

export const defaultDSM: () => DefaultDSM = () => ({
  title: '',
  type: T.ContentType.DSM,
  color: palette.mapColor,
  info: {},
});

export const defaultPointCloud: () => Pick<T.PointCloudContent, PostContentArguments> = () => ({
  title: '',
  type: T.ContentType.POINTCLOUD,
  color: palette.mapColor,
  info: {
    // All new contents from this point onward
    // will be processed by cesium.
    engine: T.PointCloudEngine.CESIUM,
  },
});


export const START_MEASUREMENT_NUMBER: number = 0;
export const START_CONTENT_NUMBER: number = 1;
export const CONTENT_TITLE_PREFIX: string = ' ';
export const CONTENT_NUMBER_GAP: number = 1;

export const defaultFeatures: T.PermissionFeature = { ddm: false, ess: false, oneD: false };
