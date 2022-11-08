
/* eslint-disable no-magic-numbers */
import Color from 'color';
import * as T from '^/types';
import dsPalette from './ds-palette';

const MeasurementsPalette: { [K in NonNullable<T.MeasurementContent['type']>]: Color } = {
  [T.ContentType.LENGTH]: new Color('#f66161'),
  [T.ContentType.VOLUME]: new Color('#3a89fe'),
  [T.ContentType.AREA]: new Color('#f7b500'),
  [T.ContentType.MARKER]: new Color('#59ac64'),
};

const OverlaysPalette: { [K in T.OverLayContent['type']]: Color } = {
  [T.ContentType.BLUEPRINT_PDF]: new Color('#f87979'),
  [T.ContentType.BLUEPRINT_DXF]: MeasurementsPalette[T.ContentType.AREA],
  [T.ContentType.BLUEPRINT_DWG]: MeasurementsPalette[T.ContentType.AREA],
  [T.ContentType.DESIGN_DXF]: new Color('#c179de'),
};

const palette = {
  mainColor: new Color('#299DD2'),
  subColor: new Color('#64C26F'),
  background: new Color('#F6F6F6'),
  mapBackgroundColorGrey: new Color('#4A4E55'),
  darkBlack: new Color('#222222'),
  textBlack: new Color('#444444'),
  textGray: new Color('#666666'),
  textLight: new Color('#999999'),
  icon: new Color('#C1C1C1'),
  iconDisabled: new Color('#efeff3'),
  border: new Color('#DBDBDB'),
  borderLight: new Color('#E5E5E5'),
  dividerLight: new Color('#b1b1b1'),
  gray: new Color('#B3B3B3'),
  lightGray: new Color('#f8f7f8'),
  darkGray: new Color('#979a9d'),
  borderGray: new Color('#DEDEDE'),
  borderGreen: new Color('#5CB667'),
  error: new Color('#FC4A4A'),
  sliderBar: new Color('#777777'),
  iconLight: new Color('#E4E4E4'),
  panelLight: new Color('#fffffff3'),
  hrGray: new Color('#b5b5b5'),
  lightBlue: new Color('#c6d9eb'),
  itemBackground: new Color('#efeff3'),
  topbarNotification: new Color('#e61313').alpha(0.65),

  loaderColor: new Color('#2F95C5'),

  mapColor: new Color('#299DD2'),
  pointerColor: new Color('#222222'),

  jpgColor: new Color('#299DD2'),
  tifColor: new Color('#E87D48'),
  lasColor: new Color('#B95BD8'),
  zipColor: new Color('#57b161'),

  pickColors: [
    new Color('#eaa0cf'),
    OverlaysPalette[T.ContentType.DESIGN_DXF],
    new Color('#9799f5'),
    new Color('#c2c2c2'),
    dsPalette.typePrimary,
  ],

  measurements: MeasurementsPalette,
  overlays: OverlaysPalette,
  ESSWorkTool: {
    [T.ContentType.ESS_ARROW]: new Color('#f7b500'),
    [T.ContentType.ESS_POLYGON]: new Color('#59ac64'),
    [T.ContentType.ESS_POLYLINE]: new Color('#f66161'),
    [T.ContentType.ESS_TEXT]: {
      fontColor: dsPalette.typePrimary,
      bgColor: new Color('white'),
    },
  },

  black: new Color('black'),
  white: new Color('white'),
  cream: new Color('#e6e4e0'),
  transparent: new Color('transparent'),

  font: new Color('#606060'),
  disabledFont: new Color('#cccccc'),
  divider: new Color('#939393'),
  tooltipBackground: new Color('black').alpha(0.6),
  hoverWhite: new Color('#5a7094'),
  uploadIcon: new Color('#b1b1b1'),
  hoverUploadIcon: new Color('#979797'),
  toggleButtonGray: new Color('#E8E8E8'),
  baseMapToggleButtonGray: new Color('#4a4e55'),
  buttonFontColor: new Color('#797979'),
  hoverBlueButton: new Color('#4e6d95'),
  lightNavyBlue: new Color('#2b4877'),
  PDFOverlayCancel: new Color('#dadadd'),
  hoverGray: new Color('#e0e0e4'),

  designDXFLayerBorder: new Color('#c179de'),
  notification: {
    DetailText: new Color('#2b4877'),
    Badge: new Color('#e88285'),
    Popup: new Color('#ffffff').alpha(0.78),
    BoxShadow: '0 1px 8px 0 rgba(0, 0, 0, 0.2), 0 3px 4px 0 rgba(0, 0, 0, 0.18), 0 3px 3px 0 rgba(0, 0, 0, 0.16)',
  },
  ContentsTabBar: {
    uploadIconDisabled: new Color('#d9d9d9'),
  },
  GroupedContentsHeader: {
    iconBackgroundDisabled: new Color('#f2f2f2'),
  },
  Calendar: {
    lightBlue: new Color('#c6d9eb'),
    disabled: new Color('#cccccc'),
    border: new Color('#cccccc'),
    weekday: new Color('#8e8e8e'),
  },
  OlMeasurementBox: {
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.16), 0 2px 2px 0 rgba(0, 0, 0, 0.16), 0 0 2px 0 rgba(0, 0, 0, 0.16)',
    cut: new Color('#c7464d'),
    fill: new Color('#21487b'),
    title: new Color('#505050'),
    divider: new Color('#606060'),
    text: new Color('#2f2f2f'),
    background: new Color('#ffffffe6'),
  },
  slider: {
    unfilledColor: new Color('#d2d2d2'),
  },
  dropdown: {
    caretColor: new Color('#A1A1A1'),
    dropdownHoverColor: new Color('#cad9e9'),
    dividerColor: new Color('#d9d9d9'),
    thumbColor: new Color('#d2d2d2'),
  },
  CalendarScreen: {
    hover: new Color('#efeff3'),
    tabBackgroundGray: new Color('#efeff3'),
    iconDefault: new Color('#A1A1A1'),
    clicked: new Color('#cad9e9'),
    font: new Color('#505050'),
    divider: new Color('#efeff3'),
    placeholder: new Color('#d2d2d2'),
  },
  MapTopBar: {
    background: new Color('#f5f5f5'),
    backgroundDisabled: new Color('#E2E2E2'),
    title: new Color('#505050'),
    titleError: new Color('#e03a3a'),
    iconBackground: new Color('#e4e4e4'),
    iconDisabled: new Color('#cccccc'),
    hoverGray: new Color('#e2e2e2'),
    divider: '#b1b1b1',
    dividerDisabled: '#d9d9d9',
    buttonIconDisabled: new Color('#c7c7c7'),
  },
  insideMap: {
    gray: new Color('#ffffff').alpha(0.74),
    hoverGray: new Color('#ffffff').alpha(0.88),
    volumeHoveredGray: new Color('#d0cbc9'),
    shadow: '0 0 10px 0 rgba(0, 0, 0, 0.54)',
  },
  ContentsList: {
    groupListHeaderTextGray: new Color('#a5a5a5'),
    groupListHeaderIconGray: new Color('#979797'),
    groupHeaderTextGray: new Color('#505050'),
    groupListDividerBackgroundGray: new Color('#efefef'),
    groupListDividerBorderGray: new Color('#dadada'),
    itemBackgroundGray: new Color('#efeff3'),
    titleHoverGray: new Color('#bccadf').alpha(0.66),
    titleActiveLightBlue: new Color('#eaeff3'),
    headerDivider: new Color('#e0e0e0'),
    itemHoverGray: new Color('#f5f5f5'),
    hoverGray: new Color('#e0e0e4'),
    editGray: new Color('#bbc6d1').alpha(0.38),
    balloonHeaderIconGray: new Color('#4d4c4c'),
    balloonBorderGray: new Color('#e5e5e5'),
    inputBorder: new Color('#cccccc'),
    hoverInputBorder: new Color('#8b8b8b'),
    title: new Color('#505050'),
    error: new Color('#c7464d'),
    toggleSwitchBlue: new Color('#88A6D2'),
    selectedButtonColor: new Color('#9eb2cc'),
    TabInContentSelect: new Color('#a2b2ca'),
  },
  EditableText: {
    errorText: new Color('#e03a3a'),
    errorBackground: new Color('#e03a3a33'),
  },
  LengthMetricList: {
    default: new Color('#F4F4F4'),
    hover: new Color('#DEDDDD'),
    active: new Color('#B1BFD3'),
  },
  VolumeContent: {
    lightNavyBlue: new Color('#2b4877'),
    SURVEY: {
      cutBar: [new Color('#fff300'), new Color('#ff7820')],
      fillBar: [new Color('#53e648'), new Color('#196d2f')],
      cut: new Color('#f17544'),
      fill: new Color('#4d8f4a'),
    },
    DESIGN: {
      cutBar: [new Color('#ffba00'), new Color('#d50100')],
      fillBar: [new Color('#01bcff'), new Color('#0017d9')],
      cut: new Color('#c7464d'),
      fill: new Color('#2b4877'),
    },
    BASIC: {
      cut: new Color('#c7464d'),
      fill: new Color('#2b4877'),
    },
    total: new Color('#505050'),
    clickedSBVCButton: new Color('#CFD6DF'),
  },
  ImagePopup: {
    arrowBackground: new Color('#333333'),
  },
  UploadPopup: {
    error: new Color('#e03a3a'),
    itemBackgroundGray: new Color('#efeff3'),
    hoverGray: new Color('#e0e0e4'),
    divider: new Color('#979797'),
    inputBorder: new Color('#cccccc'),
    guageBarGray: new Color('#e0e0e4'),
    tableBorderGray: new Color('#d9d9d9'),
    disabledTableBorder: new Color('#e8e8e8'),
  },
  DDMInput: {
    error: new Color('#e03a3a'),
    inputBorder: new Color('#cccccc'),
  },
  DownloadPopup: {
    itemBackgroundGray: new Color('#efeff3'),
    fileExtension: new Color('#004795'),
    divider: new Color('#979797'),
  },
  OlVolumeCalculationOptions: {
    paginationDot: {
      notSelected: new Color('#979797'),
      selected: new Color('#cccccc'),
    },
  },
  SideBar: {
    ContentslistBackground: new Color('#fbfbfb'),
    background: new Color('#ffffff'),
    hoverBackground: new Color('#d9d9d9'),
  },
  LoadingIcon: {
    grey: new Color('#d2d2d2'),
    blue: new Color('#1f4782'),
  },
  ShareBanner: {
    white: new Color('#ffffffd9'),
    BannerSection: new Color('#cacaca'),
    Title: new Color('#979797'),
    Detail: new Color('#505050'),
    LoginButton: new Color('#797979'),
  },
  ElevationProfile: {
    lengthTitle: new Color('#505050'),
    title: new Color('#2b4877'),
    background: 'rgba(251, 85, 85, 0.4)',
    gridLine: new Color('#d0d0d0'),
    tooltipBackground: new Color('#fafafa'),
    axis: new Color('#979797'),
    graphColors: [
      new Color('#f66161'),
      new Color('#f7b500'),
      new Color('#59ac64'),
      new Color('#3a89fe'),
      new Color('#eaa0cf'),
    ],
    addComparison: new Color('#F9F9F9'),
    purple: new Color('#aa71c1'),
    crosshair: new Color('#979797'),
    resetButton: new Color('#ffffff').alpha(0.8),
  },
  cesium: {
    horizontalArea: new Color('rgb(149, 150, 204)'),
  },
  Photo: {
    topbarBackground: new Color('#f4f4f4'),
    viewerHandleBackground: new Color('rgba(240,240,240,0.5)'),
    photoTabButtonBackground: new Color('#c7c7c7'),
    photoTabButtonText: new Color('#4d4c4c'),
    photoCountText: new Color('#908F8F'),
    backButtonBackground: new Color('#f4f4f4'),
    border: new Color('#f4f4f4'),
  },
  share: {
    border: new Color('#c7c7c7'),
    buttonBackground: new Color('#c7c7c7'),
    font: new Color('#c7c7c7'),
    dropdownListFont: new Color('#908f8f'),
    subButton: new Color('#b1b1b1'),
    subButtonHover: new Color('#979797'),
  },
  guide: {
    unreadMark: new Color('#e03a3a'),
  },
  pdf: {
    disabledBackground: new Color('#efeff3'),
  },
  noFill: new Color('rgba(0,0,0,0)'),
};

export const getColor: (color: string) => Color = (color) => new Color(color);

const baseColors: Array<Array<Color>> = [
  [palette.measurements.marker, palette.measurements.area, palette.measurements.length],
  [palette.measurements.volume, ...palette.pickColors.slice(0, 2)],
  // eslint-disable-next-line no-magic-numbers
  [...palette.pickColors.slice(2, 5)],
];

export const getColorPickerPalette: (
  params: { hasWhite?: boolean; hasNoFill?: boolean }
) => Array<Array<Color>> = ({
  hasWhite, hasNoFill,
}) => {
  const customRow: Array<Color> = [];

  if (hasWhite) {
    customRow.push(palette.white);
  }

  if (hasNoFill) {
    customRow.push(palette.noFill);
  }

  return customRow.length === 0
    ? baseColors
    : baseColors.concat([customRow]);
};

export default palette;
