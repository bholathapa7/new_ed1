import React, { FC, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';

import QuestionSVG from '^/assets/icons/contents-list/question-mark.svg';
import LoadingIcon from '^/components/atoms/LoadingIcon';
import { CUT_COLOR_MAP, FILL_COLOR_MAP } from '^/components/molecules/ContentsListVolumeItem';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { FontFamily } from '^/constants/styles';
import { UseL10n, useL10n } from '^/hooks';
import * as T from '^/types';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { L10nDictionary } from '^/utilities/l10n';
import Text from './text';
import { calculateVolume, determineUnitType } from '^/utilities/imperial-unit';
import { getImperialMeasurementUnitFromGeometryType, getMeasurementUnitFromGeometryType } from '^/components/ol/contentTypeSwitch';

const Root = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const StylesForSidebar = {
  Item:
    styled.div({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      height: '25px',
      lineHeight: '25px',
    }),
  Title:
    styled.span({
      fontSize: '12px',
      color: dsPalette.title.toString(),
    }),
  Measurement:
    styled.div<MeasurementTypesProps>(({ calcMethod, type }) => ({
      display: 'flex',
      fontSize: '13px',
      fontFamily: FontFamily.ROBOTO,
      color: colorSwitch({ calcMethod, type }),
      marginRight: '4px',
    })),
};

const TitleComponent = styled.div({
  display: 'flex',
  alignItems: 'center',
});

const Tooltip = styled(Tippy)({
  position: 'absolute',
  top: 0,
  left: 0,
  transform: 'translateX(-50%)',

  display: 'inline-block',

  width: '125px',
  maxWidth: '175px',

  borderRadius: '3px',

  pointerEvents: 'none',

  '.tippy-content': {
    padding: '4px 5px 5px 5px',
    wordBreak: 'keep-all',
  },
});

const QuestionIconWrapper = styled.div({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  height: '100%',
  marginLeft: '3px',
});

const Item = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  '&:not(:last-child)': {
    paddingBottom: '7px',
  },
});

const Title = styled.span({
  fontSize: '10px',
  fontFamily: FontFamily.NOTOSANS,
  fontWeight: 'normal',
  fontStretch: 'normal',
  fontStyle: 'normal',
  lineHeight: 'normal',
  color: palette.OlMeasurementBox.title.toString(),

  whiteSpace: 'pre',
  marginRight: '6px',
});

type MeasurementTypes = 'cut' | 'fill' | 'total';
interface MeasurementTypesProps {
  type: MeasurementTypes;
  calcMethod: T.VolumeCalcMethod;
}


function colorSwitch({ calcMethod, type }: MeasurementTypesProps): string {
  switch (type) {
    case 'cut':
      return CUT_COLOR_MAP[calcMethod];
    case 'fill':
      return FILL_COLOR_MAP[calcMethod];
    case 'total':
      return palette.VolumeContent.total.toString();
    default:
      exhaustiveCheck(type);
  }
}

const MeasurementWrapper = styled.div({
  display: 'flex',
});

const Measurement = styled.div<MeasurementTypesProps>(({ calcMethod, type }) => ({
  fontSize: '11px',
  fontFamily: FontFamily.ROBOTO,
  fontWeight: 500,
  color: colorSwitch({ calcMethod, type }),

  marginTop: '1px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const MeasurementUnit = styled.span<MeasurementTypesProps & { isSideBar?: boolean }>(({ isSideBar, calcMethod, type }) => ({
  fontWeight: 'normal',
  fontFamily: isSideBar ? FontFamily.ROBOTO : undefined,
  fontSize: isSideBar ? '13px' : '11px',
  color: colorSwitch({ calcMethod, type }),

  marginLeft: '3px',
}));

interface LoadingIconWrapper {
  scale?: number;
}

const LoadingIconWrapper = styled.div<LoadingIconWrapper>(({ scale }) => ({
  transform: scale ? `scale(${scale})` : '',
}));

const cutTextMap: { [key in T.VolumeCalcMethod]: L10nDictionary } = {
  [T.VolumeCalcMethod.BASIC]: Text.BASIC.cut,
  [T.VolumeCalcMethod.DESIGN]: Text.DESIGN.cut,
  [T.VolumeCalcMethod.SURVEY]: Text.SURVEY.cut,
};

const fillTextMap: { [key in T.VolumeCalcMethod]: L10nDictionary } = {
  [T.VolumeCalcMethod.BASIC]: Text.BASIC.fill,
  [T.VolumeCalcMethod.DESIGN]: Text.DESIGN.fill,
  [T.VolumeCalcMethod.SURVEY]: Text.SURVEY.fill,
};

/**
 * @todo make T.VolumeCalcMethod and Text.* the same type anyways
 */
const volumeCalcMethodToText: {
  vc: 'BASIC';
  dbvc: 'DESIGN';
  sbvc: 'SURVEY';
} = {
  [T.VolumeCalcMethod.BASIC]: 'BASIC',
  [T.VolumeCalcMethod.DESIGN]: 'DESIGN',
  [T.VolumeCalcMethod.SURVEY]: 'SURVEY',
};

interface QuestionIconProps {
  volumeCalcMethod: 'BASIC' | 'DESIGN' | 'SURVEY';
  measurementType: MeasurementTypes;
}

export const QuestionIcon: FC<QuestionIconProps> = ({ volumeCalcMethod, measurementType }) => {
  const [l10n]: UseL10n = useL10n();

  const text: L10nDictionary = Text[volumeCalcMethod].tooltips[measurementType];

  return (
    <Tooltip theme='angelsw' offset={T.TIPPY_OFFSET} arrow={false} placement='bottom' content={l10n(text)}>
      <QuestionIconWrapper>
        <QuestionSVG />
      </QuestionIconWrapper>
    </Tooltip>
  );
};

interface VolumeRow {
  text: L10nDictionary;
  measurement: number;
  type: MeasurementTypes;
}

const rowFactory: (text: L10nDictionary, measurement: number, type: MeasurementTypes) => VolumeRow = (
  text, measurement, type,
) => ({
  text,
  measurement,
  type,
});

interface Props {
  content: T.VolumeContent;
  loadingIconScale?: number;
  isSideBar?: boolean;
}
export const VolumeCalculatedContents: FC<Props> = ({ content, loadingIconScale, isSideBar }) => {
  const { requestVolumeCalculation }: T.ContentsState =
    useSelector((state: T.State) => state.Contents);
  const isProcessing: boolean = requestVolumeCalculation[content.id]?.status === T.APIStatus.PROGRESS;
  const calcMethod: T.VolumeCalcMethod = content.info.calculatedVolume.calculation.type;
  const [l10n]: UseL10n = useL10n();

  const {
    projectId,
    projectById,
  } = useSelector((s: T.State) => ({
    projectById: s.Projects.projects.byId,
    projectId: s.Pages.Contents.projectId,
  }));

  if (projectId === undefined) throw new Error(' No Project Id in Pages.Contents.projectId');

  const unitType: T.ValidUnitType = determineUnitType(projectById[projectId].unit);

  const generateValue: (value: number) => ReactNode = (number) => isProcessing ? (
    <>
      <LoadingIconWrapper scale={loadingIconScale}>
        <LoadingIcon />
      </LoadingIconWrapper>
    </>
  ) : <>{number}</>;

  const ItemComponent = isSideBar ? StylesForSidebar.Item : Item;
  const MeasurementComponent = isSideBar ? StylesForSidebar.Measurement : Measurement;
  const TitleTextComponent = isSideBar ? StylesForSidebar.Title : Title;

  const volumeRows: ReactNode = [
    rowFactory(isSideBar ? cutTextMap[calcMethod] : cutTextMap[calcMethod], Math.abs(content.info.calculatedVolume.cut), 'cut'),
    rowFactory(isSideBar ? fillTextMap[calcMethod] : fillTextMap[calcMethod], Math.abs(content.info.calculatedVolume.fill), 'fill'),
    rowFactory(isSideBar ? Text.total : Text.total, Math.abs(content.info.calculatedVolume.total), 'total'),
  ].map(({ text, measurement, type }, idx) => (
    <ItemComponent key={`volumerow-${idx}`}>
      <TitleComponent>
        <TitleTextComponent>
          {l10n(text)}
        </TitleTextComponent>
        {isSideBar ? <QuestionIcon volumeCalcMethod={volumeCalcMethodToText[calcMethod]} measurementType={type} /> : null}
      </TitleComponent>
      <MeasurementWrapper>
        <MeasurementComponent type={type} calcMethod={calcMethod}>
          {generateValue(parseFloat(calculateVolume(measurement, unitType).toFixed(2)))}
        </MeasurementComponent>
        <MeasurementUnit isSideBar={isSideBar} type={type} calcMethod={calcMethod}>
          {' '}
          {
            (unitType === T.UnitType.IMPERIAL) ?
              getImperialMeasurementUnitFromGeometryType({ geometryType: T.ContentType.VOLUME }) :
              getMeasurementUnitFromGeometryType({ geometryType: T.ContentType.VOLUME })
          }
        </MeasurementUnit>
      </MeasurementWrapper>
    </ItemComponent>
  ));

  return (
    <Root>
      {volumeRows}
    </Root>
  );
};
