import * as _ from 'lodash-es';
import FillStyle from 'ol/style/Fill';
import StrokeStyle from 'ol/style/Stroke';
import Text from 'ol/style/Text';

import palette, { getColor } from '^/constants/palette';
import { FontFamily } from '^/constants/styles';
import { Resolutions } from './coordinate-util';

const REGEX_COLOR: RegExp = /c:#([0-9]|[a-z])+/ig;
const REGEX_COLOR_OUTLINE: RegExp = /o:#([0-9]|[a-z])+/ig;
const REGEX_TEXT: RegExp = /t:".+"/g;
const REGEX_ANGLE: RegExp = /a:(-)?[\d\.]+/g;
const REGEX_POSITION: RegExp = /p:\d+/g;
const REGEX_FONT: RegExp = /f:"[\w\s]+"/g;
const REGEX_FONT_SIZE: RegExp = /s:[\d\.]+[g|px|pt|mm|cm|in]/g;
const REGEX_PEN_PATTERN: RegExp = /p:"[\w\s\.]+"/g;

const isStyleOfLabel: (ogrStyle: string) => boolean = (ogrStyle) => _.startsWith(ogrStyle, 'LABEL');
const isStyleOfPen: (ogrStyle: string) => boolean = (ogrStyle) => _.startsWith(ogrStyle, 'PEN');
const isStyleOfBrush: (ogrStyle: string) => boolean = (ogrStyle) => _.startsWith(ogrStyle, 'BRUSH');

const isUnitGraphic: (pattern: string) => boolean = (p) => _.endsWith(p, 'g');
const isUnitPixel: (pattern: string) => boolean = (p) => _.endsWith(p, 'px');

// eslint-disable-next-line no-magic-numbers
const toRadian: (deg: number) => number = (deg) => deg * Math.PI / 180;

const FONTSIZE_G_THRESOLD: number = 5;
const FONTSIZE_G_SCALE_SM: number = 4;
const FONTSIZE_G_SCALE_LG: number = 2;
const weight: string = 'normal';
const getFont: (weight: string, size: number, height: number, fontFamily: string) => string =
  (w, s, h, f) => `${w} ${s}px/${h}px ${f}`;

/**
 * @info https://gdal.org/user/ogr_feature_style.html#label-tool-parameters
 */
const OlTextPositions: Array<[string, string]> = [
  ['bottom', 'left'],
  ['bottom', 'center'],
  ['bottom', 'right'],
  ['middle', 'left'],
  ['middle', 'center'],
  ['middle', 'right'],
  ['top', 'left'],
  ['top', 'center'],
  ['top', 'right'],
  ['bottom', 'left'],
  ['bottom', 'center'],
  ['bottom', 'right'],
];
/**
 * @desc Return [textBaseline, textAlign]
 */
const getPosition: (p: number) => [string, string] =
  // eslint-disable-next-line no-magic-numbers
  (p) => _.inRange(p, 1, OlTextPositions.length + 1) ? OlTextPositions[p - 1] : OlTextPositions[4];

const LINE_DASH_ARRAY_MAXLENGTH: number = 4;
/**
 * @desc An attempt to make the vectors responsible (resolution-aware)
 */
const alignWithResolution: (value: number, resolution: number) => number = (value, res) =>
  // eslint-disable-next-line no-magic-numbers
  value / (res * 5)
;

/**
 * @desc Retrieve OpenLayers Text style from OGR_STYLE extracted from GeoJSON of the AutoCAD DXF
 * @info https://gdal.org/user/ogr_feature_style.html
 */
export function getTextStyle(resolution: number, ogrStyle?: string): Text {
  let textColor: string = palette.black.toString();
  let textOutlineColor: string = '';
  let textAngle: number = 0;
  let fontFamily: string = FontFamily.NOTOSANS;
  let size: number = 12;
  let height: number = 14;
  let position: number = 5;
  let text: string = '';

  if (ogrStyle !== undefined && isStyleOfLabel(ogrStyle)) {
    const colorMatches: RegExpMatchArray | null = ogrStyle.match(REGEX_COLOR);
    if (colorMatches !== null && colorMatches.length > 0) {
      textColor = colorMatches[0].substr(2);
    }

    const colorOutlineMatches: RegExpMatchArray | null = ogrStyle.match(REGEX_COLOR_OUTLINE);
    if (colorOutlineMatches !== null && colorOutlineMatches.length > 0) {
      textOutlineColor = colorOutlineMatches[0].substr(2);
    }

    const textMatches: RegExpMatchArray | null = ogrStyle.match(REGEX_TEXT);
    if (textMatches !== null && textMatches.length > 0) {
      text = textMatches[0].substr(2).replace(/"/g, '');
    }

    const angleMatches: RegExpMatchArray | null = ogrStyle.match(REGEX_ANGLE);
    if (angleMatches !== null && angleMatches.length > 0) {
      const degree: number = parseFloat(angleMatches[0].substr(2));
      textAngle = -toRadian(degree);
    }

    const positionMatches: RegExpMatchArray | null = ogrStyle.match(REGEX_POSITION);
    if (positionMatches !== null && positionMatches.length > 0) {
      position = parseInt(positionMatches[0].substr(2), 10);
    }

    const fontMatches: RegExpMatchArray | null = ogrStyle.match(REGEX_FONT);
    if (fontMatches !== null && fontMatches.length > 0) {
      fontFamily = fontMatches[0].substr(2).replace(/"/g, '');
    }

    const fontSizeMatches: RegExpMatchArray | null = ogrStyle.match(REGEX_FONT_SIZE);
    if (fontSizeMatches !== null && fontSizeMatches.length > 0) {
      const s: string = fontSizeMatches[0].substr(2);
      if (isUnitPixel(s)) {
        size = parseFloat(s.replace('px', ''));
      } else if (isUnitGraphic(s)) {
        size = parseFloat(s.replace('g', ''));
        size = size * (size < FONTSIZE_G_THRESOLD ? FONTSIZE_G_SCALE_SM : FONTSIZE_G_SCALE_LG);
      }
      size = alignWithResolution(size, resolution);
      // eslint-disable-next-line no-magic-numbers
      height = size * 1.2;
    }
  }

  const [textBaseline, textAlign]: [string, string] = getPosition(position);

  const outlineColorStyle: StrokeStyle | undefined = textOutlineColor.length > 0 ?
    new StrokeStyle({
      color: textOutlineColor,
      width: 1,
    }) : undefined;

  return new Text({
    font: getFont(weight, size, height, fontFamily),
    text,
    textAlign,
    textBaseline,
    fill: new FillStyle({
      color: textColor,
    }),
    stroke: outlineColorStyle,
    rotation: textAngle,
    offsetX: 0,
    offsetY: 0,
    overflow: true,
  });
}

/**
 * https://stackoverflow.com/questions/29900520/is-there-a-getzoomforresolution-in-openlayers-3/43030167
 */
const getZoomAtResolution: (resolution: number) => number = (resolution) =>
  // eslint-disable-next-line no-magic-numbers
  Math.log2(Resolutions[0]) - Math.log2(resolution)
;

const ZOOM_LEVEL_16: number = 16;
const TOO_THICK_WIDTH: number = 50;
const FIVE: number = 5;

/**
 * Retrieve OpenLayers Stroke style from OGR_STYLE extracted from GeoJSON of the AutoCAD DXF
 */
export function getStrokeStyle(resolution: number, ogrStyle?: string, isSelected?: boolean): StrokeStyle {
  let lineColor: string = palette.borderGreen.toString();
  let lineDash: Array<number> | undefined;
  let width: number = 1 + (isSelected ? 2 : 0);

  if (ogrStyle !== undefined && isStyleOfPen(ogrStyle)) {
    const colorMatches: RegExpMatchArray | null = ogrStyle.match(REGEX_COLOR);
    if (colorMatches !== null && colorMatches.length > 0) {
      lineColor = colorMatches[0].substr(2);
    }

    const patternMatches: RegExpMatchArray | null = ogrStyle.match(REGEX_PEN_PATTERN);
    if (patternMatches !== null && patternMatches.length > 0) {
      const pattern: Array<string> = patternMatches[0].substr(2).replace(/"/g, '').split(' ');
      if (pattern.length > 1) {
        if (isUnitPixel(pattern[0])) {
          lineDash = pattern
            .map((p) => p.replace('px', ''))
            .map(parseFloat);

          if (lineDash.length > FIVE) width = lineDash[FIVE];
        } else if (isUnitGraphic(pattern[0])) {
          lineDash = pattern
            .map((p) => p.replace('g', ''))
            .map((p) => parseFloat(p) * FONTSIZE_G_SCALE_LG)
            .map((p) => alignWithResolution(p, resolution));
          if (lineDash.length > FIVE) width = lineDash[FIVE] / FONTSIZE_G_SCALE_LG;
        }
      }

      if (lineDash && lineDash.length > LINE_DASH_ARRAY_MAXLENGTH) {
        lineDash = _.slice(lineDash, 0, LINE_DASH_ARRAY_MAXLENGTH);
      }
    }
  }

  const shouldShowWidth1: boolean = TOO_THICK_WIDTH < width || getZoomAtResolution(resolution) < ZOOM_LEVEL_16;

  return new StrokeStyle({
    color: lineColor,
    width: shouldShowWidth1 ? 1 : width,
    lineDash,
  });
}

/**
 * Retrieve OpenLayers Stroke style from OGR_STYLE extracted from GeoJSON of the AutoCAD DXF
 */
export function getFillStyle(_resolution: number, ogrStyle?: string, isSelected?: boolean): FillStyle {
  let brushColor: string = palette.white.toString();

  if (ogrStyle !== undefined && isStyleOfBrush(ogrStyle)) {
    const matches: RegExpMatchArray | null = ogrStyle.match(REGEX_COLOR);
    if (matches !== null && matches.length > 0) {
      brushColor = matches[0].substr(2);
    }
  }

  return new FillStyle({
    color: (
      isSelected ?
        // eslint-disable-next-line no-magic-numbers
        getColor(brushColor).alpha(0.7) :
        getColor(brushColor)
    ).toString(),
  });
}
