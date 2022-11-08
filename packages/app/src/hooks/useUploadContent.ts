import _ from 'lodash-es';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import XLSX from 'xlsx';

import { CRS_TITLE_LABEL_INDEX } from '^/components/molecules/SourcePhotoUpload/GCPInput';
import {
  UploadBlueprintDWG, UploadBlueprintDXF, UploadBlueprintPDF, UploadDesign, UploadDsm, UploadLas, UploadOrthophoto, UploadSourcePhoto,
} from '^/store/duck/Contents';
import { UploadPhotos } from '^/store/duck/Photos';
import * as T from '^/types';
import { getCoordinateTitles } from '^/utilities/coordinate-util';
import { formatWithOffset } from '^/utilities/date-format';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { s2ab } from '^/utilities/file-util';

const { PHOTO, SOURCE, BLUEPRINT_PDF, BLUEPRINT_DXF, BLUEPRINT_DWG, DESIGN_DXF, DSM, ORTHO, POINTCLOUD }: typeof T.AttachmentType = T.AttachmentType;

const gcpGroupInfo2CSV: (gcpGroupInfo: T.GCPGroupContent['info']) => File = ({ gcps, crs }) => {
  const titles: string[] = ['Label', ...getCoordinateTitles(crs)];

  const eastingIndex: number = titles.findIndex(
    (title) => title === T.CoordinateTitle.EASTING || title === T.CoordinateTitle.LONGITUDE,
  );
  const northingIndex: number = titles.findIndex(
    (title) => title === T.CoordinateTitle.NORTHING || title === T.CoordinateTitle.LATITUDE,
  );
  const altitudeIndex: number = titles.findIndex(
    (title) => title === T.CoordinateTitle.ALTITUDE,
  );

  const gcpRowsWithTitles: string[][] = gcps.map(({ label, easting, northing, altitude }) => {
    const row: string[] = [];

    row[CRS_TITLE_LABEL_INDEX] = label;
    row[eastingIndex] = easting.toString();
    row[northingIndex] = northing.toString();
    row[altitudeIndex] = altitude.toString();

    return row;
  });

  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([titles, ...gcpRowsWithTitles]);
  const csv: string = XLSX.utils.sheet_to_csv(ws);

  // Using Blob instead of `new File()` to support IE11
  const blob: Blob = new Blob(
    [s2ab(csv)],
    {
      type: 'text/csv',
    },
  ) as File;
  const datetime: string = formatWithOffset(0, new Date(), 'yyMMdd');

  return _.assign(blob, { name: `${datetime}_${crs}.csv` }) as File;
};

export type UseUploadContent = (props: Props) => void;

export interface Props {
  attachmentType: T.AttachmentType;
  title: string;
  files: Array<File>;
  gcpGroupInfo?: T.GCPGroupContent['info'];
  coordinateSystem?: T.CoordinateSystem;
  screen: T.Screen;
  isMeshOption?: boolean;
}

export const useUploadContent: () => UseUploadContent = () => {
  const dispatch: Dispatch = useDispatch();

  return ({
    attachmentType, title, files, coordinateSystem, screen, gcpGroupInfo, isMeshOption = false,
  }) => {
    switch (attachmentType) {
      case PHOTO:
        return dispatch(UploadPhotos({ files }));
      case SOURCE:
        const gcpsCSV: File | undefined = (() => {
          if (gcpGroupInfo === undefined) return;

          return gcpGroupInfo2CSV(gcpGroupInfo);
        })();

        return dispatch(UploadSourcePhoto({
          files: gcpsCSV !== undefined ? [gcpsCSV, ...files] : files,
          noOfStream: 3,
          screen, gcpGroupInfo, isMeshOption,
        }));
      case BLUEPRINT_PDF:
        return dispatch(UploadBlueprintPDF({ title, file: files[0] }));

      case BLUEPRINT_DXF: {
        if (coordinateSystem) {
          return dispatch(UploadBlueprintDXF({ title, file: files[0], coordinateSystem }));
        }

        break;
      }

      case BLUEPRINT_DWG: {
        if (coordinateSystem) {
          return dispatch(UploadBlueprintDWG({ title, file: files[0], coordinateSystem }));
        }

        break;
      }

      case DESIGN_DXF: {
        if (coordinateSystem) {
          return dispatch(UploadDesign({ title, file: files[0], coordinateSystem }));
        }

        break;
      }

      case ORTHO: {
        return dispatch(UploadOrthophoto({ file: files[0], screen }));
      }

      case DSM: {
        return dispatch(UploadDsm({ file: files[0], screen }));
      }

      case POINTCLOUD: {
        return dispatch(UploadLas({ file: files[0], screen }));
      }

      default:
        return exhaustiveCheck(attachmentType);
    }

    throw new Error(`try to upload wrong data: ${attachmentType}`);
  };
};
