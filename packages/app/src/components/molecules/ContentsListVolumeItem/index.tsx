import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import VolumeBasicSvg from '^/assets/icons/contents-list/volume-basic.svg';
import VolumeDBVCSvg from '^/assets/icons/contents-list/volume-dbvc.svg';
import VolumeSBVCSvg from '^/assets/icons/contents-list/volume-sbvc.svg';

import TutorialBasicEN from '^/assets/icons/tutorial/volume-basic-en.png';
import TutorialBasicKR from '^/assets/icons/tutorial/volume-basic-kr.png';
import TutorialDesignEN from '^/assets/icons/tutorial/volume-dbvc-en.png';
import TutorialDesignKR from '^/assets/icons/tutorial/volume-dbvc-kr.png';
import TutorialSurveyEN from '^/assets/icons/tutorial/volume-sbvc-en.png';
import TutorialSurveyKR from '^/assets/icons/tutorial/volume-sbvc-kr.png';

import { ContentsListItem } from '^/components/atoms/ContentsListItem';
import LoadingIcon from '^/components/atoms/LoadingIcon';
import { TutorialPosition, TutorialWrapperHoverable } from '^/components/atoms/TutorialWrapperHoverable';
import { VolumeCalculatedContents } from '^/components/atoms/VolumeCalculatedContents';
import ContentsListSurveyDSMItem from '^/components/molecules/ContentsListVolumeItem/VolumeContent/dsmInfo';
import palette from '^/constants/palette';
import { FontFamily } from '^/constants/styles';
import tutorial from '^/constants/tutorial';
import { UseL10n, UseState, useIsVolumeOutdated, useL10n, useUpdateVolume } from '^/hooks';
import { RequestVolumeCalculation } from '^/store/duck/Contents';
import * as T from '^/types';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import { Basic } from './VolumeContent/basic';
import { Design } from './VolumeContent/design';
import { Survey } from './VolumeContent/survey';
import { Fallback } from './fallback';
import Text from './text';
import { calculateVolume, determineUnitType } from '^/utilities/imperial-unit';
import { getImperialMeasurementUnitFromGeometryType, getMeasurementUnitFromGeometryType } from '^/components/ol/contentTypeSwitch';

const LOADING_ICON_SCALE: number = 0.7;
const TUTORIAL_WIDTH: number = 226;
const TUTORIAL_MARGIN: number = 5;

export const CUT_COLOR_MAP: { [key in T.VolumeCalcMethod]: string } = {
  [T.VolumeCalcMethod.BASIC]: palette.VolumeContent.BASIC.cut.toString(),
  [T.VolumeCalcMethod.DESIGN]: palette.VolumeContent.DESIGN.cut.toString(),
  [T.VolumeCalcMethod.SURVEY]: palette.VolumeContent.SURVEY.cut.toString(),
};

export const FILL_COLOR_MAP: { [key in T.VolumeCalcMethod]: string } = {
  [T.VolumeCalcMethod.BASIC]: palette.VolumeContent.BASIC.fill.toString(),
  [T.VolumeCalcMethod.DESIGN]: palette.VolumeContent.DESIGN.fill.toString(),
  [T.VolumeCalcMethod.SURVEY]: palette.VolumeContent.SURVEY.fill.toString(),
};


interface CalcMethodProps {
  calcMethod: T.VolumeCalcMethod;
}

interface SelectedProps {
  isSelected: boolean;
}

const Spliter = styled.div({
  paddingTop: '7px',
  width: '100%',
  borderTop: `1px solid ${palette.ContentsList.balloonBorderGray.toString()}`,
  marginTop: '14px',
});

const Balloon1 = styled.div({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  marginTop: '10.4px',
  marginBottom: '17.5px',
  width: '100%',
});

const BalloonContent = styled.div({
  '> span': {
    fontFamily: FontFamily.ROBOTO,
  },
  wordBreak: 'break-all',
  fontSize: '18px',
  fontWeight: 500,
  lineHeight: 1.39,
});

const CutContent = styled.span<CalcMethodProps>(({ calcMethod }) => ({
  marginRight: '5px',
  color: CUT_COLOR_MAP[calcMethod],
}));
const FillContent = styled.span<CalcMethodProps>(({ calcMethod }) => ({
  color: FILL_COLOR_MAP[calcMethod],
}));
const UnitWrapper = styled.span<CalcMethodProps>(({ calcMethod }) => ({
  fontSize: '13px',
  color: FILL_COLOR_MAP[calcMethod],
}));

const ErrorTitle = styled.span({
  fontWeight: 600,
  color: palette.error.toString(),
});
const ErrorDescription = styled.span({
  marginTop: '6.5px',
  lineHeight: 1.55,
  fontSize: '11px',
  color: palette.error.toString(),
});
const Balloon2 = styled.div({
  boxSizing: 'border-box',
  width: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const CalculationAlgorithmButtonWrapper = styled.div({
  position: 'relative',

  display: 'flex',
  marginBottom: '18px',
});

const VolumeBasicWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  fontSize: '10px',
  alignItems: 'center',
});

const CalcMethodButton = styled.button<SelectedProps & CalcMethodProps>(({ calcMethod, isSelected }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  width: '74px',
  height: '28px',
  cursor: 'pointer',
  marginRight: calcMethod === T.VolumeCalcMethod.SURVEY ? '0px' : '2px',
  backgroundColor: isSelected ? palette.ContentsList.selectedButtonColor.toString() : palette.ContentsList.itemBackgroundGray.toString(),

  borderRadius: (() => {
    switch (calcMethod) {
      case T.VolumeCalcMethod.SURVEY: {
        return '0px 8px 8px 0px';
      }
      case T.VolumeCalcMethod.BASIC: {
        return '8px 0px 0px 8px';
      }
      default: {
        return undefined;
      }
    }
  })(),

  '> svg > g': isSelected ? {
    'path:first-child': {
      fill: calcMethod === T.VolumeCalcMethod.SURVEY ? palette.VolumeContent.clickedSBVCButton.toString() : palette.white.toString(),
    },
    'path:nth-child(n+2)': {
      fill: palette.white.toString(),
    },
  } : undefined,

  ':hover': !isSelected ? {
    backgroundColor: palette.ContentsList.hoverGray.toString(),
  } : undefined,
}));

const CalcMethodText = styled.div<SelectedProps>(({ isSelected }) => ({
  width: '74px',
  marginTop: '6px',
  textAlign: 'center',
  letterSpacing: '-0.2px',
  fontWeight: 400,
  color: (isSelected ? palette.ContentsList.title : palette.dividerLight).toString(),
}));

const BasicTutorialImg = styled.img({
  width: '100%',
  height: '71px',

  marginTop: '8px',
  marginBottom: '2px',
});

const SurveyTutorialImg = styled.img({
  width: '100%',
  height: '57px',

  marginTop: '4px',
  marginBottom: '20px',
});

const DesignTutorialImg = styled.img({
  width: '100%',
  height: '56px',

  marginTop: '5px',
  marginBottom: '20px',
});


const getTutorialPosition: (type: T.VolumeCalcMethod) => TutorialPosition = (type) => {
  switch (type) {
    case T.VolumeCalcMethod.BASIC:
      return TutorialPosition.TOP_RIGHT;
    case T.VolumeCalcMethod.DESIGN:
      return TutorialPosition.MIDDLE_TOP;
    case T.VolumeCalcMethod.SURVEY:
      return TutorialPosition.TOP_LEFT;

    default:
      return exhaustiveCheck(type);
  }
};

export interface VolumeTutorialImageProps {
  type: T.VolumeCalcMethod;
}
export const VolumeTutorialImage: FC<VolumeTutorialImageProps> = ({ type }) => {
  const [, language]: UseL10n = useL10n();

  const getImageByLanguage: (img1: string, img2: string) => string = useCallback((img1, img2) => language === T.Language.KO_KR ? img1 : img2, []);

  switch (type) {
    case T.VolumeCalcMethod.BASIC:
      return <BasicTutorialImg src={getImageByLanguage(TutorialBasicKR, TutorialBasicEN)} />;
    case T.VolumeCalcMethod.SURVEY:
      return <SurveyTutorialImg src={getImageByLanguage(TutorialSurveyKR, TutorialSurveyEN)} />;
    case T.VolumeCalcMethod.DESIGN:
      return <DesignTutorialImg src={getImageByLanguage(TutorialDesignKR, TutorialDesignEN)} />;
    default:
      return exhaustiveCheck(type);
  }
};

export interface Props {
  content: T.VolumeContent;
  isPinned?: boolean;
}

export const RawContentsListVolumeItem: FC<Props> = ({ content, isPinned = false }) => {
  const {
    Pages: { Contents: { editingContentId, projectId } },
    Contents: { requestVolumeCalculation },
    Projects: { projects: { byId: projectById } },
  }: T.State = useSelector((state: T.State) => state);
  const [currentCalcMethod, setCurrentCalcMethod]: UseState<T.VolumeCalcMethod | undefined> =
    useState(content.info.calculatedVolume?.calculation?.type);
  const [l10n]: UseL10n = useL10n();
  const dispatch: Dispatch = useDispatch();
  const isVolumeOutdated: boolean = useIsVolumeOutdated(content);
  const updateVolume: () => void = useUpdateVolume(content);

  /**
   * @todo Because of Dohun, there are lots of wrong migrated volume data
   * After solving that problem please delete this statement
   */
  if (content.info.calculatedVolume === undefined || content.info.calculatedVolume.calculation === undefined) return null;

  const isCalculating: boolean = requestVolumeCalculation[content.id]?.status === T.APIStatus.PROGRESS;
  const isEditing: boolean = editingContentId === content.id;
  const dsmInfo: T.DSMInfo | undefined = content.config?.dsm;
  const isOtherCalcMethodSelected: boolean = currentCalcMethod !== content.info.calculatedVolume.calculation.type;
  const hasErrorMsg: boolean = !isCalculating && Boolean(content.info.isBoundaryViolated);

  if (projectId === undefined) throw new Error(' No Project Id in Pages.Contents.projectId');

  const unitType: T.ValidUnitType = determineUnitType(projectById[projectId].unit);

  useEffect(() => {
    setCurrentCalcMethod(content.info.calculatedVolume.calculation.type);
  }, [content.info.calculatedVolume.calculation.type]);

  useEffect(() => {
    if (!isEditing) return;
    if (isVolumeOutdated) updateVolume();
  }, [editingContentId]);

  const onBasicComparsionClick: () => void = () => {
    setCurrentCalcMethod(T.VolumeCalcMethod.BASIC);
    if (content.info.calculatedVolume.calculation.type !== T.VolumeCalcMethod.BASIC) {
      dispatch(RequestVolumeCalculation({
        contentId: content.id,
        info: {
          type: T.VolumeCalcMethod.BASIC,
          volumeAlgorithm: T.BasicCalcBasePlane.TRIANGULATED,
          volumeElevation: 0,
        },
      }));
    }
  };

  const onDesignComparsionClick: () => void = () => {
    setCurrentCalcMethod(T.VolumeCalcMethod.DESIGN);
  };

  const onSurveyComparsionClick: () => void = () => {
    setCurrentCalcMethod(T.VolumeCalcMethod.SURVEY);
  };

  function getVolumeMeasurement(): ReactNode {
    if (currentCalcMethod === undefined) return;

    const errorDescription: ReactNode = hasErrorMsg ? (
      <>
        <Spliter />
        <ErrorDescription>
          {l10n(Text.dbvcBoundaryViolation.description)}
        </ErrorDescription>
      </>
    ) : undefined;

    return (
      <>
        {calcMethodMap[currentCalcMethod]}
        {errorDescription}
      </>
    );
  }

  const cutValue: ReactNode = (
    <CutContent calcMethod={currentCalcMethod}>
      {calculateVolume(content.info.calculatedVolume?.cut, unitType).toFixed(2)},
    </CutContent>
  );

  const fillValue: ReactNode = (
    <FillContent calcMethod={currentCalcMethod}>
      {calculateVolume(content.info.calculatedVolume?.fill, unitType).toFixed(2)}
    </FillContent>
  );

  const unit: ReactNode = (
    <UnitWrapper calcMethod={currentCalcMethod}>
      {' '}
      {
        (unitType === T.UnitType.IMPERIAL) ?
          getImperialMeasurementUnitFromGeometryType({ geometryType: T.ContentType.VOLUME }) :
          getMeasurementUnitFromGeometryType({ geometryType: T.ContentType.VOLUME })
      }
    </UnitWrapper>
  );

  const buttonFactory: (
    type: T.VolumeCalcMethod, handler: () => void, icon: ReactNode,
  ) => ReactNode = (type, handler, icon) => (
    <VolumeBasicWrapper>
      <TutorialWrapperHoverable
        width={TUTORIAL_WIDTH}
        margin={TUTORIAL_MARGIN}
        position={getTutorialPosition(type)}
        title={l10n(Text.comparison[type])}
        description={l10n(Text.tutorial[type])}
        image={<VolumeTutorialImage type={type} />}
        link={tutorial.volumeCalculation}
        isZendesk={true}
      >
        <CalcMethodButton
          onClick={handler}
          isSelected={currentCalcMethod === type}
          calcMethod={type}
        >
          {icon}
        </CalcMethodButton>
      </TutorialWrapperHoverable>
      <CalcMethodText isSelected={currentCalcMethod === type}>
        {l10n(Text.comparison[type])}
      </CalcMethodText>
    </VolumeBasicWrapper>
  );

  const calculatedInformation: ReactNode = !isOtherCalcMethodSelected && !hasErrorMsg ? (
    <Spliter>
      <VolumeCalculatedContents content={content} loadingIconScale={LOADING_ICON_SCALE} isSideBar={true} />
    </Spliter>
  ) : undefined;

  const visualization: ReactNode = !isOtherCalcMethodSelected && dsmInfo && !hasErrorMsg ? (
    <ContentsListSurveyDSMItem
      content={content}
      role={projectById[content.projectId].permissionRole}
      dsmInfo={dsmInfo}
    />
  ) : undefined;

  const calcMethodMap: { [key in T.VolumeCalcMethod]: ReactNode } = {
    [T.VolumeCalcMethod.BASIC]: (
      <Basic content={content}>
        {calculatedInformation}
      </Basic>
    ),
    [T.VolumeCalcMethod.DESIGN]: (
      <Design content={content}>
        {calculatedInformation}
        {visualization}
      </Design>
    ),
    [T.VolumeCalcMethod.SURVEY]: (
      <Survey content={content}>
        {calculatedInformation}
        {visualization}
      </Survey>
    ),
  };

  const cutAndFill: ReactNode = isCalculating ? (
    <LoadingIcon />
  ) : content.info.isBoundaryViolated ? (
    <>
      <ErrorTitle>
        {l10n(Text.dbvcBoundaryViolation.title)}
      </ErrorTitle>
    </>
  ) : (
    <>
      {cutValue}
      {fillValue}
      {unit}
    </>
  );

  return (
    <ContentsListItem
      isPinned={isPinned}
      className={CANCELLABLE_CLASS_NAME}
      content={content}
      firstBalloonTitle={l10n(Text.title)}
    >
      <Balloon1>
        <BalloonContent>
          {cutAndFill}
        </BalloonContent>
      </Balloon1>
      <Balloon2>
        <CalculationAlgorithmButtonWrapper>
          {buttonFactory(T.VolumeCalcMethod.BASIC, onBasicComparsionClick, <VolumeBasicSvg />)}
          {buttonFactory(T.VolumeCalcMethod.DESIGN, onDesignComparsionClick, <VolumeDBVCSvg />)}
          {buttonFactory(T.VolumeCalcMethod.SURVEY, onSurveyComparsionClick, <VolumeSBVCSvg />)}
        </CalculationAlgorithmButtonWrapper>
      </Balloon2>
      {getVolumeMeasurement()}
    </ContentsListItem>
  );
};

export const ContentsListVolumeItem: FC<Props> = withErrorBoundary(RawContentsListVolumeItem)(Fallback);
