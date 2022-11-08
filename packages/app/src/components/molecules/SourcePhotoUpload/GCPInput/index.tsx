/* eslint-disable max-lines */
import _ from 'lodash-es';
import React, { ReactElement, ReactNode, memo, useCallback, useEffect, useMemo, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';
import XLSX from 'xlsx';

import QuestionMarkSvg from '^/assets/icons/question-mark.svg';
import AttachDropdown, { Option } from '^/components/atoms/AttachDropdown';
import MiniToggleButton, { Props as MiniToggleButtonProps } from '^/components/atoms/MiniToggleButton';
import WarningAlert from '^/components/atoms/WarningAlert';
import WrapperHoverable, { Props as WrapperHoverableProps } from '^/components/atoms/WrapperHoverable';
import { defaultMapZoom } from '^/constants/defaultContent';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import {
  UseGetScreenDateAndTitle,
  UseL10n,
  UseState,
  typeGuardGCPGroups,
  useGetScreenDateAndTitle,
  useL10n,
  UseToast,
  defaultToastInfoOption,
  useToast,
} from '^/hooks';
import {
  ChangeCreatingGCPGroupInfo, ChangeEditingGCPIndex, ChangeTwoDDisplayCenter,
  ChangeTwoDDisplayZoom, SetUpdateTwoDDisplayCenter, SetUpdateTwoDDisplayZoom,
} from '^/store/duck/Pages';
import * as T from '^/types';
import { Formats } from '^/utilities/date-format';
import { gcpsToGeoPoints } from '^/utilities/gcp-util';
import { getMidPoint } from '^/utilities/map-util';
import CoordinateSystemDropdown from '../../CoordinateSystemDropdown';
import CoordinateTable, { RowValue } from '../../CoordinateTable';
import Text from './text';

export const CRS_TITLE_LABEL_INDEX: number = 0;
const DEFAULT_DISABLED_TITLE_INDEXES: Array<number> = [CRS_TITLE_LABEL_INDEX];
export const MIN_GCP_NUMBER: number = 4;


interface ErrorProps {
  hasError?: boolean;
}

const InputWrapper = styled.li({
  margin: '0 30px 30px',
});

const OptionWrapper = styled(InputWrapper)({
  margin: '30px 30px 10px',
});

const WarningAlertWrapper = styled.div({
  marginTop: '30px',
});

const AttachDropdownWrapper = styled.div({
  height: '37px',
});

const TableDescription = styled.p<ErrorProps>(({ hasError }) => ({
  color: hasError ? palette.UploadPopup.error.toString() : dsPalette.title.toString(),
  fontSize: '11px',

  marginTop: '10px',
  marginBottom: hasError ? '6px' : undefined,
}));

const LabelWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',

  marginBottom: '10px',
});

const OptionLabelWrapper = styled(LabelWrapper)({
  marginBottom: 0,
});

const LabelButtonWrapper = styled.div({
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
});

const Label = styled.div({
  fontSize: '14px',
  fontWeight: 'bold',
  color: dsPalette.title.toString(),
});

const QuestionMarkIcon = styled(QuestionMarkSvg)({
  cursor: 'pointer',
});

const DropdownWrapper = styled.div({
  width: '100%',

  marginTop: '10px',
});

const TooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0px 4px',
  },
  tooltipBackgroundStyle: {
    borderRadius: '6px',
  },
  tooltipTargetStyle: {
    display: 'flex',
    justifyContent: 'center',
  },
  tooltipBalloonStyle: {
    bottom: 'auto',
    left: '-33px',
    transform: 'translateY(calc(50% + 7px))',

    maxWidth: 'unset',
    width: '225px',
  },
  tooltipTextTitleStyle: {
    whiteSpace: 'pre-wrap',
    padding: '15px',

    lineHeight: 1.58,
  },
};

const toggleButtonStyle: Pick<MiniToggleButtonProps, 'width' | 'height'> = {
  width: 36,
  height: 20,
};


const paddingWithEmptyString: (arrLength: number) => RowValue = (arrLength) => Array(Math.max(0, MIN_GCP_NUMBER - arrLength)).fill('');
const paddingGCPLabel: (rows: RowValue[]) => RowValue[] = (rows) => rows.map((row, rowIndex) => {
  if (row?.length === undefined) return ['', '', '', ''];
  if (row.length > MIN_GCP_NUMBER) {
    return row.splice(0, MIN_GCP_NUMBER);
  }
  if (row.length < MIN_GCP_NUMBER) {
    if (row.length === MIN_GCP_NUMBER - 1) {
      return [`${rowIndex}`, ...row];
    } else {
      return [...row, ...paddingWithEmptyString(row.length)];
    }
  } else {
    return row;
  }
});

export const getErrorRowIndexes: (rowValues: RowValue[]) => number[] = (rowValues) => {
  const indexes: number[] = [];

  rowValues.forEach((rowValue, rowIndex) => {
    if (rowValue.every((value) => value === '')) return;

    const hasError: boolean = rowValue.some((value, columnIndex) => value === '' || (columnIndex !== CRS_TITLE_LABEL_INDEX && isNaN(Number(value))));

    if (hasError) indexes.push(rowIndex);
  });

  return indexes;
};

interface SelectorState {
  readonly twoDDisplayCenter: T.ContentsPageState['twoDDisplayCenter'];
  readonly twoDDisplayZoom: T.ContentsPageState['twoDDisplayZoom'];
}

export interface Props {
  readonly isGCPUsing: boolean;
  readonly usingGCPScreenId?: T.Screen['id'];
  readonly crsTitles: string[];
  readonly gcps: T.GCP[];
  readonly rows: RowValue[];
  readonly crs: T.CoordinateSystem;
  readonly hasGCPError?: boolean;
  onUsingGCPChange(isGCPUsing: boolean): void;
  onUsingGCPScreenIdChange(screenId: T.Screen['id'] | undefined): void;
  onGCPsChange(gcps: T.GCPGroupContent['info']['gcps']): void;
  onGCPTitlesChange(titles: Array<string>): void;
  onRowsChange(rowValues: RowValue[]): void;
  onCRSChange(coordinateSystem: T.CoordinateSystem): void;
  onError(hasError: boolean): void;
}

function GCPInput({
  hasGCPError = false,
  isGCPUsing, usingGCPScreenId, crsTitles, gcps, rows, crs,
  onUsingGCPChange, onUsingGCPScreenIdChange, onGCPsChange, onGCPTitlesChange, onRowsChange, onCRSChange, onError,
}: Props): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();
  const toastify: UseToast = useToast();
  const getScreenDateAndTitle: UseGetScreenDateAndTitle = useGetScreenDateAndTitle();

  const crsTitlesWithLabel: Array<string> = useMemo(() => [l10n(Text.label), ...crsTitles], [l10n, crsTitles]);

  const eastingIndex: number = useMemo(() => crsTitlesWithLabel.findIndex(
    (title) => title === T.CoordinateTitle.EASTING || title === T.CoordinateTitle.LONGITUDE,
  ), [crsTitlesWithLabel]);
  const northingIndex: number = useMemo(() => crsTitlesWithLabel.findIndex(
    (title) => title === T.CoordinateTitle.NORTHING || title === T.CoordinateTitle.LATITUDE,
  ), [crsTitlesWithLabel]);
  const altitudeIndex: number = useMemo(() => crsTitlesWithLabel.findIndex(
    (title) => title === T.CoordinateTitle.ALTITUDE,
  ), [crsTitlesWithLabel]);

  const rowsToGCPs: (rowValues: RowValue[]) => T.GCP[] = useCallback((rowValues) => rowValues
    .filter((rowValue) => rowValue.every((val) => val && val !== ''))
    .map<T.GCP>((rowValue) => ({
      label: rowValue[CRS_TITLE_LABEL_INDEX],
      easting: Number(rowValue[eastingIndex]),
      northing: Number(rowValue[northingIndex]),
      altitude: Number(rowValue[altitudeIndex]),
    })), [eastingIndex, northingIndex, altitudeIndex]);

  const gcpsToRows: (gcps: T.GCP[]) => RowValue[] = useCallback((nextGCPs) => nextGCPs.map(({ label, easting, northing, altitude }) => {
    const row: RowValue = [];

    row[CRS_TITLE_LABEL_INDEX] = label;
    row[eastingIndex] = easting.toString();
    row[northingIndex] = northing.toString();
    row[altitudeIndex] = altitude.toString();

    return row;
  }), [eastingIndex, northingIndex, altitudeIndex]);

  const sortedGCPGroupContents: T.GCPGroupContent[] = useSelector((s: T.State) => typeGuardGCPGroups(
    s.Contents.contents.allIds
      .filter((id) => s.Contents.contents.byId[id].type === T.ContentType.GCP_GROUP)
      .map((id) => s.Contents.contents.byId[id])
      .filter((content) => content.screenId !== undefined ? s.Screens.screens.findIndex((screen) => screen.id === content.screenId) > -1 : false)
      .sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const aScreen: T.Screen = s.Screens.screens.find((screen) => screen.id === a.screenId)!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const bScreen: T.Screen = s.Screens.screens.find((screen) => screen.id === b.screenId)!;

        return bScreen.appearAt.valueOf() - aScreen.appearAt.valueOf();
      }),
  ));
  const attachDropdownOptions: Option[] = useSelector((s: T.State) => sortedGCPGroupContents
    .map<Option>((content) => {
      const text: Option['text'] = (() => {
        if (content.screenId !== undefined) {
          const gcpGroupContentScreen: T.Screen | undefined = s.Screens.screens.find((screen) => screen.id === content.screenId);

          if (gcpGroupContentScreen !== undefined) {
            return Object.values(getScreenDateAndTitle(gcpGroupContentScreen.id, Formats.YYMMDD)).join(' ');
          }
        }

        return '';
      })();

      return { text, value: `${content.id}` };
    }),
  );
  const { twoDDisplayCenter, twoDDisplayZoom }: SelectorState = useSelector<T.State, SelectorState>((s) => ({
    twoDDisplayCenter: s.Pages.Contents.twoDDisplayCenter,
    twoDDisplayZoom: s.Pages.Contents.twoDDisplayZoom,
  }), shallowEqual);

  const [errorRowIndexes, setErrorRowIndexes]: UseState<number[]> = useState<number[]>([]);

  useEffect(() => {
    onRowsChange(gcpsToRows(gcps));

    return () => {
      batch(() => {
        dispatch(ChangeCreatingGCPGroupInfo({}));
        dispatch(ChangeEditingGCPIndex({}));
      });
    };
  }, []);

  useEffect(() => {
    if (hasGCPError) onError(false);
  }, [rows]);

  useEffect(() => {
    const nextErrorRowIndexes: number[] = getErrorRowIndexes(rows);

    setErrorRowIndexes(nextErrorRowIndexes);
    onGCPsChange(rowsToGCPs(rows.filter((_row, rowIndex) => !nextErrorRowIndexes.includes(rowIndex))));
  }, [rows, crsTitles]);

  useEffect(() => {
    const gcpPoints: Array<T.GeoPoint> | undefined = gcpsToGeoPoints(gcps, crs);
    if (gcpPoints === undefined || gcpPoints.length <= 0) {
      dispatch(ChangeCreatingGCPGroupInfo({}));

      return;
    }

    const midPoint: T.GeoPoint = getMidPoint(gcpPoints);
    if (midPoint.some(isNaN)) return;

    batch(() => {
      dispatch(ChangeCreatingGCPGroupInfo({ gcpGroupInfo: { gcps, crs: T.ProjectionEnum[crs] } }));

      /**
       * @warning if the previous value and the value that you want to change the store to are the same,
       * then it won't be worked.
       * @todo if there's no problem with updating these, please delete if expressions
       */
      /* eslint-disable no-magic-numbers */
      dispatch(ChangeTwoDDisplayCenter({ twoDDisplayCenter: (() => {
        if (twoDDisplayCenter.every((value, index) => midPoint[index] === value)) {
          midPoint[0] = midPoint[0] + 0.0001;
        }

        return midPoint;
      })() }));
      dispatch(ChangeTwoDDisplayZoom({ twoDDisplayZoom: twoDDisplayZoom === defaultMapZoom ? defaultMapZoom + 0.0001 : defaultMapZoom }));

      dispatch(SetUpdateTwoDDisplayCenter({ shouldUpdateTwoDDisplayCenter: true }));
      dispatch(SetUpdateTwoDDisplayZoom({ shouldUpdateTwoDDisplayZoom: true }));
    });
  }, [gcps, crs]);

  const findGCPIndexWithRowIndex: (rowIndex: number) => number | undefined = useCallback((rowIndex) => {
    const nextErrorRowIndexes: number[] = getErrorRowIndexes(rows);

    if (nextErrorRowIndexes.includes(rowIndex)) return;

    const findingRow: RowValue | undefined = rows[rowIndex];

    if (findingRow === undefined) return;

    const findingGCP: T.GCP[] = rowsToGCPs([findingRow]);

    if (findingGCP.length === 0) return;

    const { label, easting, northing, altitude }: T.GCP = findingGCP[0];

    const gcpIndex: number = gcps.findIndex((gcp) => gcp.label === label &&
        gcp.easting === easting &&
        gcp.northing === northing &&
        gcp.altitude === altitude);

    return gcpIndex > -1 ? gcpIndex : undefined;
  }, [rows, gcps, rowsToGCPs]);

  const handleCRSSelect: (coordinateSystem: T.CoordinateSystem) => void = useCallback((nextCRS) => {
    onCRSChange(nextCRS);
  }, [onCRSChange]);

  const handleGCPTitles: (crsTitlesWithLabel: Array<string>) => void = useCallback((nextCRSTitlesWithLabel) => {
    const nextCRSTitles: Array<string> = [...nextCRSTitlesWithLabel].splice(1);

    const changedTitleIndex: number = nextCRSTitles.findIndex((title, index) => crsTitles[index] !== title);
    const changedTitle: string = nextCRSTitles[changedTitleIndex];
    const originalTitleIndex: number = crsTitles.findIndex((title) => title === changedTitle);

    if (changedTitleIndex >= 0 && originalTitleIndex >= 0 && crsTitles[changedTitleIndex].length > 0) {
      nextCRSTitles[originalTitleIndex] = crsTitles[changedTitleIndex];
    }

    onUsingGCPScreenIdChange(undefined);
    onGCPTitlesChange(nextCRSTitles);
  }, [crsTitles, onUsingGCPScreenIdChange, onGCPTitlesChange]);

  const handleGCPLoad: (value: Option['value']) => void = useCallback((gcpGroupContentId) => {
    const gcpGroupContent: T.GCPGroupContent | undefined = sortedGCPGroupContents.find((content) => content.id === Number(gcpGroupContentId));

    if (gcpGroupContent === undefined) {
      throw new Error('Contact Admin: GCPUpload cannot find gcp info');
    }

    onUsingGCPScreenIdChange(gcpGroupContent.screenId);
    onCRSChange(gcpGroupContent.info.crs);
    onRowsChange([...gcpsToRows(gcpGroupContent.info.gcps)]);
  }, [sortedGCPGroupContents, onUsingGCPScreenIdChange, onCRSChange, onRowsChange, gcpsToRows]);

  /**
   * @TODO This is not working when rows are not suitable.
   */
  const handleCSVAttach: (file: File) => void = useCallback((file) => {
    const reader: FileReader = new FileReader();
    reader.onload = (e: ProgressEvent) => {
      if (!e.target) {
        return;
      }
      const { result }: FileReader = e.target as FileReader;
      const fileData: Uint8Array = new Uint8Array(result as ArrayBuffer);
      const workbook: XLSX.WorkBook = XLSX.read(fileData, { type: 'array' });

      const firstWorkSheet: XLSX.WorkSheet = workbook.Sheets[workbook.SheetNames[0]];
      const fileRowValues: RowValue[] = XLSX.utils.sheet_to_json(firstWorkSheet, { header: 1, defval: '' });

      const paddingRowValues: RowValue[] = paddingGCPLabel([...fileRowValues]);

      onUsingGCPScreenIdChange(undefined);
      onRowsChange(paddingRowValues);
    };
    reader.readAsArrayBuffer(file); // Using readAsBuffer to support IE11, instead of readAsString
    toastify({
      type: T.Toast.INFO,
      content: {
        title: Text.infoTitle,
        description: Text.infoDescription,
      },
      option: defaultToastInfoOption,
    });
  }, [onUsingGCPScreenIdChange, onRowsChange]);

  const handleGCPsChange: (rowValues: RowValue[]) => void = useCallback((rowValues) => {
    onRowsChange([...rowValues]);

    if (usingGCPScreenId !== undefined) {
      onUsingGCPScreenIdChange(undefined);
    }
  }, [onRowsChange, usingGCPScreenId, onUsingGCPScreenIdChange]);

  const handleGCPHover: (rowIndex?: number) => void = useCallback((rowIndex) => {
    dispatch(ChangeEditingGCPIndex({ editingGCPIndex: rowIndex !== undefined ? findGCPIndexWithRowIndex(rowIndex) : undefined }));
  }, [findGCPIndexWithRowIndex]);

  const tableDescription: ReactNode = useMemo(() => usingGCPScreenId !== undefined ? (
    <TableDescription>
      {`${l10n(Text.loadedFrom)}${Object.values(getScreenDateAndTitle(usingGCPScreenId, Formats.YYMMDD)).join(' ')}`}
    </TableDescription>
  ) : null, [l10n, getScreenDateAndTitle, usingGCPScreenId]);

  const gcpErrorDescription: ReactNode = useMemo(() => hasGCPError && gcps.length < MIN_GCP_NUMBER ? (
    <TableDescription hasError={hasGCPError}>{l10n(Text.errorMessage)}</TableDescription>
  ) : null, [hasGCPError, gcps.length, l10n]);

  const optionWarning: ReactNode = useMemo(() => !isGCPUsing ? (
    <WarningAlertWrapper>
      <WarningAlert texts={[`${l10n(Text.optionWarning)} ${l10n(Text.optionBoldWarning)}`]} />
    </WarningAlertWrapper>
  ) : null, [l10n, isGCPUsing]);

  const inputs: ReactNode = isGCPUsing ? (
    <>
      <InputWrapper key='attachdropdown'>
        <AttachDropdownWrapper>
          <AttachDropdown
            text={l10n(Text.attachDropdownLabel)}
            options={attachDropdownOptions}
            attachFileText={l10n(Text.attach)}
            noOptionText={l10n(Text.noGCP)}
            fileExtension='.csv'
            onAttach={handleCSVAttach}
            onClick={handleGCPLoad}
          />
        </AttachDropdownWrapper>
        {tableDescription}
      </InputWrapper>
      <InputWrapper key='crsdropdown'>
        <LabelWrapper>
          <Label>{l10n(Text.coordinateLabel)}</Label>
          <WrapperHoverable
            title={l10n(Text.coordinateTooltip)}
            customStyle={TooltipCustomStyle}
          >
            <QuestionMarkIcon />
          </WrapperHoverable>
        </LabelWrapper>
        <DropdownWrapper>
          <CoordinateSystemDropdown
            value={crs}
            onSelect={handleCRSSelect}
          />
        </DropdownWrapper>
      </InputWrapper>
      <InputWrapper key='gcptable'>
        <LabelWrapper>
          <Label>{`${l10n(Text.gcp)} (${gcps.length})`}</Label>
          <WrapperHoverable
            title={l10n(Text.gcpTooltip)}
            customStyle={TooltipCustomStyle}
          >
            <QuestionMarkIcon />
          </WrapperHoverable>
        </LabelWrapper>
        {gcpErrorDescription}
        <CoordinateTable
          coordinateSystem={crs}
          titles={crsTitlesWithLabel}
          disabledTitleIndexes={DEFAULT_DISABLED_TITLE_INDEXES}
          rows={rows}
          hasTableError={hasGCPError}
          errorRowIndexes={errorRowIndexes}
          onRowsChange={handleGCPsChange}
          onTitlesChange={handleGCPTitles}
          onRowHover={handleGCPHover}
        />
      </InputWrapper>
    </>
  ) : null;

  return (
    <Scrollbars>
      <OptionWrapper key='gcpoption'>
        <LabelButtonWrapper>
          <OptionLabelWrapper>
            <Label>{l10n(Text.processingWithGCPs)}</Label>
            <WrapperHoverable
              title={l10n(Text.description)}
              customStyle={TooltipCustomStyle}
            >
              <QuestionMarkIcon />
            </WrapperHoverable>
          </OptionLabelWrapper>
          <MiniToggleButton width={toggleButtonStyle.width} height={toggleButtonStyle.height} isRight={isGCPUsing} onChange={onUsingGCPChange} />
        </LabelButtonWrapper>
        {optionWarning}
      </OptionWrapper>
      {inputs}
    </Scrollbars>
  );
}

export default memo(GCPInput);
