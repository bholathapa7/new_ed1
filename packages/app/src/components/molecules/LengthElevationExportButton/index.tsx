import _ from 'lodash-es';
import React, { FC, Fragment, ReactNode, useRef, useState, MutableRefObject } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import FileExportSvg from '^/assets/icons/elevation-profile/export.svg';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { DeviceWidth } from '^/constants/styles';
import { UseL10n, UseState, UseWindowSize, useClickOutside, useL10n, useRole, useWindowSize } from '^/hooks';
import { OpenContentPagePopup } from '^/store/duck/Pages';
import * as T from '^/types';
import { isAllowExportMultipleElevation } from '^/utilities/role-permission-check';
import Color from 'color';
import { LengthElevationProfile, _csv, _dxf, _export } from './length-elevation-export-button-utils';
import Text from './text';
import { determineUnitType } from '^/utilities/imperial-unit';

export interface CSVLangHeaders {
  distance: string;
  MapDateOrDXFName: string;
}

const FileExportIconWrapper = styled.div({
  height: '33px',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  paddingLeft: '12.5px',
  paddingRight: '12.5px',

  marginRight: '21px',

  fontSize: '14px',
  color: 'var(--color-theme-primary-lighter)',

  border: '1px solid var(--color-theme-primary-lighter)',
  backgroundColor: 'transparent',
  borderRadius: '5px',
  cursor: 'pointer',

  zIndex: 500,
});

const ExportDropdownRoot = styled.div({
  borderRadius: '5px',
  backgroundColor: palette.white.toString(),
  boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.18), 0 2px 6px 0 rgba(0, 0, 0, 0.16), 0 5px 10px 0 rgba(0, 0, 0, 0.14)',
  position: 'absolute',
  right: '41px',
  top: '72px',
  zIndex: 500,
});

const ExportDropdownOption = styled.button({
  width: '100%',
  height: '35.3px',
  backgroundColor: palette.white.toString(),
  borderRadius: '5px',
  cursor: 'pointer',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',

  paddingLeft: '15px',
  paddingRight: '15px',

  ':hover': {
    borderRadius: 0,
    backgroundColor: palette.dropdown.dropdownHoverColor.toString(),
  },

  ':first-child': {
    borderTopLeftRadius: '5px',
    borderTopRightRadius: '5px',
  },

  ':last-child': {
    borderBottomLeftRadius: '5px',
    borderBottomRightRadius: '5px',
  },
});

const ExportDropdownExportAsText = styled.span({
  fontSize: '12px',
  color: dsPalette.title.toString(),
  display: 'inline',
});

const ExportDropdownDimensionText = ExportDropdownExportAsText;

const ExportDropdownOptionText = styled(ExportDropdownExportAsText)({});


const ExportSentence = styled.p({ paddingRight: 10.5 });

const ExportSentenceWithLangWrapper = styled.p({
  display: 'flex',
  alignItems: 'center',
});

const Divider = styled.div({
  height: '1px',
  backgroundColor: palette.borderLight.toString(),
});

const ExportSentenceWithLang: FC<{
  optionText: string;
  exportAsText: string;
  dimensionText: string;
  lang: T.Language;
}> = ({ optionText, exportAsText, dimensionText, lang }) => {
  const optionTextNode: ReactNode = (
    <ExportDropdownOptionText data-testid='export-dropdown-option-text'>
      {optionText}
    </ExportDropdownOptionText>
  );
  const exportAsTextNode: ReactNode = (
    <ExportDropdownExportAsText data-testid='export-dropdown-option-text'>
      {exportAsText}
    </ExportDropdownExportAsText>
  );
  const dimensionTextNode: ReactNode = (
    <ExportDropdownDimensionText data-testid='export-dropdown-option-text'>
      {dimensionText}
    </ExportDropdownDimensionText>
  );
  const textOrderedByLanguage: ReactNode = lang === T.Language.KO_KR ?
    <>{optionTextNode}&nbsp;{exportAsTextNode}&nbsp;{dimensionTextNode}</> :
    <>{exportAsTextNode}&nbsp;{optionTextNode}&nbsp;{dimensionTextNode}</>;

  return (
    <ExportSentenceWithLangWrapper>
      {textOrderedByLanguage}
    </ExportSentenceWithLangWrapper>
  );
};

export interface Props {
  readonly editingLengthContent?: T.LengthContent;
  readonly comparisonTitles: Array<string>;
  readonly comparisonColors: Array<Color>;
  readonly projectProjection?: T.ProjectionEnum;
}

export const LengthElevationExportButton: FC<Props> = ({ editingLengthContent, comparisonTitles, comparisonColors, projectProjection }) => {
  const [isExportButtonClicked, setIsExportButtonClicked]: UseState<boolean> = useState<boolean>(false);
  const [l10n]: UseL10n = useL10n();
  const [windowX]: UseWindowSize = useWindowSize();

  const role: T.PermissionRole = useRole();

  const dispatch: Dispatch = useDispatch();
  const lang: T.Language = useSelector((state: T.State) => state.Pages.Common.language);
  const { Pages, Projects: { projects } }: T.State = useSelector((state: T.State) => state);

  const exportRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  const { projectId }: T.ContentsPageState = Pages.Contents;
  const { byId: projectById } = useSelector((s: T.State) => s.Projects.projects);

  if (projectId === undefined) throw new Error(' No Project Id in Pages.Contents.projectId');
  const projectTitle: string = projects.byId[projectId].title;

  const unitType: T.ValidUnitType = determineUnitType(projectById[projectId].unit);

  // eslint-disable-next-line max-len
  const fileName: string = `${l10n(comparisonTitles.length === 1 ? Text.singleElevationFileTitle : Text.multiElevationFileTitle)}(${comparisonTitles[0]})_${projectTitle}`;
  const langHeaders: CSVLangHeaders = { distance: l10n((
    (unitType === T.UnitType.IMPERIAL) ? Text.imperialDisatnceHeader : Text.metricDisatnceHeader
  )), MapDateOrDXFName: l10n(Text.MapDateOrDXFName) };

  const lengthElevationProfile: LengthElevationProfile = {
    editingLengthContent, comparisonTitles, comparisonColors, projectProjection,
  };

  const handleExportButtonClick: () => void = () => setIsExportButtonClicked((prevState: boolean) => !prevState);

  const handleFileExportToCSV: (unit: T.ValidUnitType) => () => void =
    (unit) => () => _export(_csv(lengthElevationProfile, langHeaders, unit), fileName);
  const handleFileExportToDXF: (is2D: boolean, unit: T.ValidUnitType) => () => void =
    (is2D, unit) => () => _export(_dxf(lengthElevationProfile, is2D, unit), fileName);

  const exportFunctions: Readonly<Array<() => void>> = [
    handleFileExportToCSV(unitType),
    handleFileExportToDXF(true, unitType),
    handleFileExportToDXF(false, unitType),
  ];

  useClickOutside({ ref: exportRef, callback: () => {
    if (isExportButtonClicked) {
      setIsExportButtonClicked(false);
    }
  } });


  const formats: Array<string> = l10n(Text.formats);
  const exportDropdownOptions: ReactNode = _.zip(l10n(Text.formats), l10n(Text.dimension))
    .map(([option, dimension]: [string, string], idx: number) => {
      function authedExport(): void {
        if (!isAllowExportMultipleElevation(role)) {
          dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.NO_PERMISSION }));

          return;
        }

        exportFunctions[idx]();
      }

      const trackingIdLabel: string = (() => {
        const downloadType: string = option.replace('.', '').toLowerCase();
        const label: string = `btn-download-as-${downloadType}`;

        if (!dimension) {
          return label;
        }

        // e.g. `(2D)` -> `2d`
        return `${label}-${dimension.match(/\d/)?.[0]}d`;
      })();

      return (<Fragment key={`export-dropdown-option-${idx}`}>
        <ExportDropdownOption
          data-ddm-track-action='elevation-profile-tools'
          data-ddm-track-label={trackingIdLabel}
          onClick={authedExport}
          data-testid={`export-dropdown-option-${idx}`}
        >
          <ExportSentenceWithLang
            data-testid={`export-sentence-with-lang-${idx}`}
            optionText={option}
            dimensionText={dimension}
            exportAsText={`${l10n(Text.exportSentence)}`}
            lang={lang}
          />
        </ExportDropdownOption>
        {idx !== formats.length - 1 ? <Divider /> : null}
      </Fragment>);
    });


  const exportDropdown: ReactNode = isExportButtonClicked ? (
    <>
      <ExportDropdownRoot ref={exportRef} data-testid='export-dropdown-root'>
        {exportDropdownOptions}
      </ExportDropdownRoot>
    </>
  ) : null;

  return (windowX <= DeviceWidth.TABLET) ? null : (
    <FileExportIconWrapper
      data-testid='file-export-icon-wrapper'
      onClick={handleExportButtonClick}
    >
      <ExportSentence>{l10n(Text.exportSentence)}</ExportSentence>
      <FileExportSvg />
      {exportDropdown}
    </FileExportIconWrapper>
  );
};

export default LengthElevationExportButton;
