import Drawing, { ThreeDCoordinates } from 'dxf-writer';
import _ from 'lodash-es';
import proj4 from 'proj4';
import XLSX from 'xlsx';

import * as T from '^/types';
import { getEPSGfromProjectionLabel, getLatLongYXLabel, projectionSystem } from '^/utilities/coordinate-util';
import Color from 'color';
import { CSVLangHeaders } from './index';
import { VALUES_PER_METER } from '^/utilities/imperial-unit';

const ExportedDXFColorMap: {[key: string]: any } = {
  'rgb(246, 97, 97)': Drawing.ACI.RED,
  'rgb(247, 181, 0)': Drawing.ACI.YELLOW,
  'rgb(89, 172, 100)': Drawing.ACI.GREEN,
  'rgb(58, 137, 254)': Drawing.ACI.BLUE,
  'rgb(234, 160, 207)': Drawing.ACI.MAGENTA,
  'rgb(170, 113, 193)': Drawing.ACI.MAGENTA,
};

export interface LengthElevationProfile {
  projectProjection?: T.ProjectionEnum;
  editingLengthContent?: T.LengthContent;
  comparisonTitles: Array<string>;
  comparisonColors: Array<Color>;
}

export const isProjectProjectionUnsupported: (
  projectProjection?: T.ProjectionEnum,
) => boolean = (
  projectProjection,
) => (!Object.values(T.ProjectionEnum).includes(projectProjection as T.ProjectionEnum));

export const defineExportProjection: (
  projectProjection?: T.ProjectionEnum,
) => string = (
  projectProjection,
) => {
  const epsg3857: string = 'EPSG:3857';
  const epsg4326: string = 'EPSG:4326';

  let epsgProjection: string;

  if (isProjectProjectionUnsupported(projectProjection)) {
    epsgProjection = epsg3857;
  } else {
    epsgProjection = getEPSGfromProjectionLabel(projectProjection as T.ProjectionEnum);
    epsgProjection = epsgProjection === epsg4326 ? epsg3857 : epsgProjection;
  }

  proj4.defs(projectionSystem);

  return epsgProjection;
};

export const isLengthUnsafeToExport: (lastLengthContent?: T.LengthContent) => boolean = (lastLengthContent) => {
  if (!lastLengthContent) return true;
  const { elevations }: T.LengthContent['info'] = lastLengthContent.info;
  return !elevations || elevations.length === 0;
};

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export function _csv(lengthElevationProfile: LengthElevationProfile, langHeaders: CSVLangHeaders, unitType: T.ValidUnitType): Blob {
  const { editingLengthContent, comparisonTitles, projectProjection }: LengthElevationProfile = lengthElevationProfile;
  if (isLengthUnsafeToExport(editingLengthContent)) throw new Error('No Elevation found');

  const epsgProjection: string = defineExportProjection(projectProjection);

  let csv: string = '';
  const [longLabel, latLabel]: [string, string] = getLatLongYXLabel({ proj: projectProjection, isFull: true });
  const header: Array<Array<string>> = [[latLabel, longLabel, 'Z', langHeaders.distance, langHeaders.MapDateOrDXFName]];
  let contents: Array<Array<string>> = [];

  for (let i: number = 0; i < (editingLengthContent as T.LengthContent).info.elevations!.length; i++) {
    if (!comparisonTitles[i]) throw new Error(`No comparison title for ${editingLengthContent?.id}`);

    const points: Array<T.LengthElevationRawData> = editingLengthContent!.info.elevations![i].points
      .map(([lon, lat, dist, alt]) => [
        ...proj4('EPSG:4326', epsgProjection).forward([lon, lat]),
        dist * VALUES_PER_METER[unitType],
        alt * VALUES_PER_METER[unitType],
      ]) as Array<T.LengthElevationRawData>;

    contents = contents.concat(points.map(([lon, lat, dist, alt]) => [lat, lon, alt, dist, comparisonTitles[i]].map((d) => d.toString())));
  }
  const sheetRows: Array<Array<string>> = _.concat(header, contents);
  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sheetRows);
  csv = csv.concat(XLSX.utils.sheet_to_csv(ws));

  // Using Blob instead of `new File()` to support IE11
  return new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }) as File;
}

export function _dxf(lengthElevationProfile: LengthElevationProfile, is2D: boolean, unitType: T.ValidUnitType): string {
  const { editingLengthContent, comparisonTitles, comparisonColors, projectProjection }: LengthElevationProfile = lengthElevationProfile;
  if (isLengthUnsafeToExport(editingLengthContent)) throw new Error('No Elevation found');

  const epsgProjection: string = defineExportProjection(projectProjection);
  const d: Drawing = new Drawing();

  for (let i: number = 0; i < (editingLengthContent as T.LengthContent).info.elevations!.length; i++) {
    if (!comparisonTitles[i]) throw new Error(`No comparison title for ${editingLengthContent?.id}`);

    const points: Array<T.LengthElevationRawData> = (editingLengthContent as T.LengthContent).info.elevations![i].points
      .map(([lon, lat, dist, alt]) => [
        ...proj4('EPSG:4326', epsgProjection).forward([lon, lat]),
        dist * VALUES_PER_METER[unitType],
        alt * VALUES_PER_METER[unitType],
      ]) as Array<T.LengthElevationRawData>;
    const title: string = comparisonTitles[i].replace(/[^\w\s]/g, '').replace(/\s/g, '_');

    d.addLineType('CONTINUOUS', '______', []);
    d.addLayer(title, ExportedDXFColorMap[comparisonColors[i].toString()] || Drawing.ACI.WHITE, 'CONTINUOUS');
    d.setActiveLayer(title);

    if (is2D) d.drawPolyline(points.map(([, , dist, alt]) => [dist, alt]));
    // eslint-disable-next-line max-len
    else d.drawPolyline3d(points.map(([lon, lat, , alt]) => [...proj4('EPSG:4326', epsgProjection).forward([lon, lat]), alt]) as Array<ThreeDCoordinates>,);
  }

  return d.toDxfString();
}

export function _export(target: Blob | string, fileName: string): void {
  if (target instanceof Blob) {
    const file: File = _.assign(target, { name: `${fileName}.csv` }) as File;
    const url: string = URL.createObjectURL(file);
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(file, file.name);
    } else {
      const link: HTMLAnchorElement = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  } else {
    const a: HTMLAnchorElement = document.createElement('a');
    a.id = 'download';
    a.download = `${fileName}.dxf`;
    document.body.appendChild(a);
    const data: Blob = new Blob([target], { type: 'application/dxf' });
    const url: string = URL.createObjectURL(data);
    a.href = url;
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
