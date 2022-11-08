/* eslint-disable max-lines */
import _ from 'lodash-es';
import React, { FC, FormEvent, KeyboardEvent, ReactNode, useCallback, useEffect, useState, memo as ReactMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled, { CSSObject } from 'styled-components';

import QuestionMarkSVG from '^/assets/icons/contents-list/question-mark.svg';
import { SubmitButton as RawSubmitButton } from '^/components/atoms/Buttons';
import { DoubleSlider, DoubleSliderIndex, DoubleSliderValues, Props as DoubleSliderProps } from '^/components/atoms/DoubleSlider';
import MiniToggleButton from '^/components/atoms/MiniToggleButton';
import SingleSlider from '^/components/atoms/SingleSlider';
import WrapperHoverable, { Props as WrapperHoverableProps } from '^/components/atoms/WrapperHoverable';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { FontFamily } from '^/constants/styles';
import { UseL10n, UseState, useL10n } from '^/hooks';
import { PatchContent } from '^/store/duck/Contents';
import * as T from '^/types';
import { arePropsEqual } from '^/utilities/react-util';
import { isAllowToggleDSMElevation } from '^/utilities/role-permission-check';
import Text from './text';

const GAP: number = 0.01;
const OPACITY_FACTOR: number = 100;


const SpliterBottom = styled.div({
  width: '100%',
  borderTop: `1px solid ${palette.ContentsList.balloonBorderGray.toString()}`,
  marginTop: '7px',
});

const Root = styled.div({
  width: '100%',
});

const ToggleButtonSection = styled.div({
  marginTop: '14px',
  fontSize: '12px',
  color: dsPalette.title.toString(),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const ToggleText = styled.span<{ isIn3D: boolean }>(({ isIn3D }) => ({
  marginRight: '5px',
  opacity: isIn3D ? '.5' : undefined,
}));

const ToggleContentSection = styled.div<{ isVisible?: boolean }>(({ isVisible }) => ({
  display: isVisible ? 'block' : 'none',
}));

const OpacitySection = styled.div({
  paddingTop: '11.7px',
  paddingBottom: '16.5px',
});

const TitleSection = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '12px',
  color: dsPalette.title.toString(),
});

const SliderTitleWrapper = styled(TitleSection)({
  justifyContent: 'flex-start',
  alignItems: 'flex-end',
});
const CutFillTitle = styled.div({
  height: '18px',
  fontSize: '12px',
  lineHeight: '18px',
  color: dsPalette.title.toString(),
});

const TitleRight = styled.div({
  userSelect: 'none',
  height: '19px',
  fontWeight: 500,
  lineHeight: 1.92,
  fontFamily: FontFamily.ROBOTO,
  color: 'var(--color-theme-primary-lighter)',
});

const Spliter = styled.div({
  clear: 'both',
});

const SliderWrapper = styled.div<{ hasMargin?: boolean }>(({ hasMargin }) => ({
  paddingTop: '8px',
  paddingBottom: hasMargin ? '17px' : '0x',
}));

const GraphSliderSection = styled.div({});

const NoGraphSliderSection = styled.div({
  height: '64px',
  fontSize: '12px',
  fontWeight: 'normal',
  fontStretch: 'normal',
  fontStyle: 'normal',
  lineHeight: 1.25,
  letterSpacing: 'normal',
  color: palette.textLight.toString(),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
const TooltipWrapper = styled.div({
  display: 'flex',
  fontSize: '14px',
  marginLeft: '3px',
});

const InformationInput = styled.input.attrs({
  type: 'number',
  step: 0.01,
})`
  border: solid 1px ${palette.ContentsList.inputBorder.toString()};
  border-radius: 5px;
  width: 65px;
  height: 29px;
  text-align: center;
  color: var(--color-theme-primary-lighter);
  font-weight: 500;
  font-size: 12px;
  font-family: ${FontFamily.ROBOTO};
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
    -moz-appearance: none;
    appearance: none;
  }
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
    -moz-appearance: none;
    appearance: none;
  }
`;

const Unit = styled.span({
  width: '12px',
  height: '13px',
  color: dsPalette.title.toString(),
  fontFamily: FontFamily.ROBOTO,
  fontSize: '13px',
});

const InformationWrapper = styled.div({
  paddingTop: '11.5px',
  display: 'flex',
  justifyContent: 'space-between',
});
const InformationItem = styled.div({
  display: 'flex',
  width: '83px',
  height: '31px',
  justifyContent: 'space-between',
});
const InformationRightWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
});
const SubmitButton = styled(RawSubmitButton)({
  width: '100%',
  marginTop: '16.5px',
});
const ToggleContainer = styled.div<{ isIn3D: boolean }>(({ isIn3D }) => ({
  opacity: isIn3D ? '0.5' : undefined,
  ' button': isIn3D ? {
    cursor: 'default',
  } : undefined,
}));


const defaultMarkerStyle: CSSObject = {
  cursor: 'pointer',
  borderRadius: '2px',
  width: '8px',
  height: '12px',
  backgroundColor: palette.white.toString(),
  // eslint-disable-next-line no-magic-numbers
  boxShadow: `0 0 2px 0 ${palette.black.alpha(0.95).toString()}`,
  zIndex: 1,
  border: 'solid 0px #000',
};

const defaultSliderRootStyle: CSSObject = {
  height: '8px',
  backgroundColor: palette.slider.unfilledColor.toString(),
  backgroundImage: `
    linear-gradient(45deg, #DBDBDB 25%, transparent 25%),
    linear-gradient(-45deg, #DBDBDB 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #DBDBDB 75%),
    linear-gradient(-45deg, transparent 75%, #DBDBDB 75%)
  `,
  backgroundSize: '6px 6px',
  backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px',
};

const tooltipWrapperStyle: CSSObject = {
  position: 'relative',
  display: 'inline-block',
};
const tooltipTargetStyle: CSSObject = {
  display: 'flex',
  justifyContent: 'center',
};
const tooltipBalloonStyle: CSSObject = {
  bottom: 'unset',
  top: 'calc(100% + 3px)',
  left: '50%',

  transform: 'translateX(-50%)',

  width: '125px',
  maxWidth: 'unset',
};
const tooltipTextTitleStyle: CSSObject = {
  whiteSpace: 'pre-wrap',
  lineHeight: 1.25,
};

export const tooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle,
  tooltipTargetStyle,
  tooltipBalloonStyle,
  tooltipTextTitleStyle,
};

const cutBarColorMap: {[key in T.VolumeCalcMethod]: string} = {
  [T.VolumeCalcMethod.DESIGN]: `${palette.VolumeContent.DESIGN.cutBar[0].toString()}, ${palette.VolumeContent.DESIGN.cutBar[1].toString()}`,
  [T.VolumeCalcMethod.SURVEY]: `${palette.VolumeContent.SURVEY.cutBar[0].toString()}, ${palette.VolumeContent.SURVEY.cutBar[1].toString()}`,
  [T.VolumeCalcMethod.BASIC]: `${palette.VolumeContent.SURVEY.cutBar[0].toString()}, ${palette.VolumeContent.SURVEY.cutBar[1].toString()}`,
};

const fillBarColorMap: {[key in T.VolumeCalcMethod]: string} = {
  [T.VolumeCalcMethod.DESIGN]: `${palette.VolumeContent.DESIGN.fillBar[0].toString()}, ${palette.VolumeContent.DESIGN.fillBar[1].toString()}`,
  [T.VolumeCalcMethod.SURVEY]: `${palette.VolumeContent.SURVEY.fillBar[0].toString()}, ${palette.VolumeContent.SURVEY.fillBar[1].toString()}`,
  [T.VolumeCalcMethod.BASIC]: `${palette.VolumeContent.SURVEY.fillBar[0].toString()}, ${palette.VolumeContent.SURVEY.fillBar[1].toString()}`,
};

const getFilledBarStyle: { [K in T.VolumeSlider]: (calcMethod: T.VolumeCalcMethod) => CSSObject } = {
  [T.VolumeSlider.CUT]: (calcMethod) => ({
    backgroundImage: `linear-gradient(0.25turn, ${cutBarColorMap[calcMethod]})`,
  }),
  [T.VolumeSlider.FILL]: (calcMethod) => ({
    backgroundImage: `linear-gradient(0.25turn, ${fillBarColorMap[calcMethod]})`,
  }),
};

const to2DecimalPoint: (target: number) => number = (target) => Number(target.toFixed(2));

const initRange: (dsmInfo: T.DSMInfo) => T.SurveyDoubleSlider = (dsmInfo) => {
  const survey: T.SurveyContent | undefined = dsmInfo.percents.survey;

  return survey ?
    [survey.minHigh, survey.maxHigh, survey.minLow, survey.maxLow].map(to2DecimalPoint) as T.SurveyDoubleSlider :
    [0, 0, 0, 0];
};

const isValidRange: (
  range: T.SurveySingleSlider, value: T.SurveySingleSlider,
) => boolean = (
  range, value,
) =>
  !value.some((item) => item > Number(range[1]) || item < Number(range[0]));

const isElementsZero: (value: T.SurveySingleSlider) => boolean = (value) =>
  value.every((item) => item === 0);

const initSliderRanges: (
  rangeInfo: T.CalculatedVolumeInfo['minMaxElevation'],
) => T.SurveyDoubleSlider = (
  rangeInfo,
) => {
  const defaultRange: T.SurveyDoubleSlider = [0, 0, 0, 0];

  if (rangeInfo) {
    defaultRange[T.SurveyType.CUT_MAX] = Math.max(rangeInfo.maxHeight, 0);
    defaultRange[T.SurveyType.CUT_MIN] = Math.max(rangeInfo.minHeight, 0);

    if (rangeInfo.minHeight > 0) {
      defaultRange[T.SurveyType.FILL_MIN] = 0;
      defaultRange[T.SurveyType.FILL_MAX] = 0;
    } else if (rangeInfo.maxHeight >= 0 && rangeInfo.minHeight < 0) {
      defaultRange[T.SurveyType.FILL_MIN] = 0;
      defaultRange[T.SurveyType.FILL_MAX] = -rangeInfo.minHeight;
    } else {
      defaultRange[T.SurveyType.FILL_MIN] = -rangeInfo.maxHeight;
      defaultRange[T.SurveyType.FILL_MAX] = -rangeInfo.minHeight;
    }
  }

  return defaultRange.map(to2DecimalPoint) as T.SurveyDoubleSlider;
};

export interface Props {
  role: T.PermissionRole;
  content: T.VolumeContent;
  dsmInfo: T.DSMInfo;
}

const ContentsListSurveyDSMItem: FC<Props> = ({
  dsmInfo, content, role,
}) => {
  const dispatch: Dispatch = useDispatch();

  const [memo, setMemo]: UseState<T.DSMInfo> = useState<T.DSMInfo>(dsmInfo);
  const [sliderValues, setSliderValues]: UseState<T.SurveyDoubleSlider> =
    useState<T.SurveyDoubleSlider>(initRange(dsmInfo));
  const [sliderRanges, setSliderRanges]: UseState<T.SurveyDoubleSlider> =
    useState<T.SurveyDoubleSlider>(initSliderRanges(content.info.calculatedVolume?.minMaxElevation));
  const [l10n]: UseL10n = useL10n();
  const isIn3D: T.ContentsPageState['in3D'] = useSelector((s: T.State) => s.Pages.Contents.in3D);

  const calcMethod: T.VolumeCalcMethod = content.info.calculatedVolume.calculation.type;
  const opacityValue: string = memo.opacity.toFixed(0);
  const backgroundOpacity: number = Number(memo.opacity.toFixed(0)) / OPACITY_FACTOR;

  const survey: T.SurveyContent | undefined = memo.percents.survey;
  const sliderDefaultValues: { [K in T.VolumeSlider]: T.SurveySingleSlider } = survey ? {
    [T.VolumeSlider.CUT]: [survey.minHigh, survey.maxHigh].map(to2DecimalPoint) as T.SurveySingleSlider,
    [T.VolumeSlider.FILL]: [survey.minLow, survey.maxLow].map(to2DecimalPoint) as T.SurveySingleSlider,
  } : {
    [T.VolumeSlider.CUT]: [0, 0],
    [T.VolumeSlider.FILL]: [0, 0],
  };
  const minMaxElevation: T.CalculatedVolumeInfo['minMaxElevation'] | undefined =
    content.info.calculatedVolume?.minMaxElevation;

  useEffect(() => {
    setMemo(dsmInfo);
    setSliderValues(initRange(dsmInfo));
  }, [JSON.stringify(dsmInfo)]);

  useEffect(() => {
    setSliderRanges(initSliderRanges(minMaxElevation));
  }, [minMaxElevation?.minHeight, minMaxElevation?.maxHeight]);

  const changeToggle: () => void = useCallback(() => {
    if (isIn3D || !isAllowToggleDSMElevation(role)) {
      return;
    }

    const newMemo: T.DSMInfo = {
      ...memo,
      isOn: !dsmInfo.isOn,
    };
    dispatch(PatchContent({
      content: {
        ...content,
        config: {
          ...content.config,
          dsm: newMemo,
        },
      },
    }));
    setMemo(newMemo);
  }, [role, isIn3D, dsmInfo.isOn]);

  const handleSliderAction: (isCut: boolean, values: DoubleSliderValues) => void = (
    isCut, values,
  ) => {
    if (memo.percents.survey) {
      const cutSliderInfo: Pick<T.SurveyContent, 'minHigh' | 'maxHigh'> = {
        minHigh: to2DecimalPoint(values[DoubleSliderIndex.FIRST_SLIDER]),
        maxHigh: to2DecimalPoint(values[DoubleSliderIndex.SECOND_SLIDER]),
      };
      const fillSliderInfo: Pick<T.SurveyContent, 'minLow' | 'maxLow'> = {
        minLow: to2DecimalPoint(values[DoubleSliderIndex.FIRST_SLIDER]),
        maxLow: to2DecimalPoint(values[DoubleSliderIndex.SECOND_SLIDER]),
      };

      const newMemo: T.DSMInfo = {
        ...memo,
        percents: {
          ...memo.percents,
          survey: {
            ...memo.percents.survey,
            ...(isCut ? cutSliderInfo : fillSliderInfo),
          },
        },
      };

      setMemo(newMemo);
      setSliderValues(initRange(newMemo));
    }
  };

  const handleCutSliderChange: (values: DoubleSliderValues) => void = (values) =>
    handleSliderAction(true, values);

  const handleFillSliderChange: (values: DoubleSliderValues) => void = (values) =>
    handleSliderAction(false, values);

  const handleOpacity: (value: number) => void = (value) =>
    setMemo({
      ...memo,
      opacity: value,
    });

  const handleSubmit: () => void = () => {
    dispatch(PatchContent({
      content: {
        ...content,
        config: {
          ...content.config,
          dsm: memo,
        },
      },
    }));
  };

  const sliderInformation: (type: T.SurveyType) => ReactNode = (type) => {
    const handleChange: (e: FormEvent<HTMLInputElement>) => void = (e) => {
      const value: number = Number(e.currentTarget.value);
      const tempSliderValues: T.SurveyDoubleSlider = [...sliderValues] as T.SurveyDoubleSlider;
      tempSliderValues.splice(type, 1, value);
      setSliderValues(tempSliderValues as T.SurveyDoubleSlider);
    };

    const handleBlur: () => void = () => {
      if (memo.percents.survey === undefined) return;
      const isHandleCut: boolean = [T.SurveyType.CUT_MAX, T.SurveyType.CUT_MIN].includes(type);
      const isHandleFill: boolean = [T.SurveyType.FILL_MIN, T.SurveyType.FILL_MAX].includes(type);
      if (!isHandleCut && !isHandleFill) return;
      if (sliderValues.some((i) => isNaN(Number(i)))) return;

      let newMemo: T.DSMInfo = {
        ...memo,
      };
      if (isHandleCut) {
        const isCutSliderValueValid: boolean = sliderValues[T.SurveyType.CUT_MIN] < sliderValues[T.SurveyType.CUT_MAX]
          && sliderValues[T.SurveyType.CUT_MIN] >= sliderRanges[T.SurveyType.CUT_MIN]
          && sliderValues[T.SurveyType.CUT_MAX] <= sliderRanges[T.SurveyType.CUT_MAX];

        if (isCutSliderValueValid) {
          newMemo = {
            ...memo,
            percents: {
              ...memo.percents,
              survey: {
                ...memo.percents.survey,
                minHigh: to2DecimalPoint(sliderValues[T.SurveyType.CUT_MIN]),
                maxHigh: to2DecimalPoint(sliderValues[T.SurveyType.CUT_MAX]),
              },
            },
          };
        }
      } else {
        const isFillSliderValueValid: boolean = sliderValues[T.SurveyType.FILL_MIN] < sliderValues[T.SurveyType.FILL_MAX]
          && sliderValues[T.SurveyType.FILL_MIN] >= sliderRanges[T.SurveyType.FILL_MIN]
          && sliderValues[T.SurveyType.FILL_MAX] <= sliderRanges[T.SurveyType.FILL_MAX];

        if (isFillSliderValueValid) {
          newMemo = {
            ...memo,
            percents: {
              ...memo.percents,
              survey: {
                ...memo.percents.survey,
                minLow: to2DecimalPoint(sliderValues[T.SurveyType.FILL_MIN]),
                maxLow: to2DecimalPoint(sliderValues[T.SurveyType.FILL_MAX]),
              },
            },
          };
        }
      }
      setMemo(newMemo);
      setSliderValues(initRange(newMemo));
    };

    const handleKeyUp: (e: KeyboardEvent<HTMLInputElement>) => void = (e) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur();
      }
    };

    return (
      <InformationItem>
        <InformationInput
          data-testid={`survey-dsm-item-input${type}`}
          value={sliderValues[type]}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyUp={handleKeyUp}
        />
        <InformationRightWrapper>
          <Unit>
            {'m'}
          </Unit>
        </InformationRightWrapper>
      </InformationItem>
    );
  };

  const createDoubleSlider: (type: T.VolumeSlider) => ReactNode = (type) => {
    const isCut: boolean = type === T.VolumeSlider.CUT;
    const isValid: boolean = isValidRange((isCut ?
      [sliderRanges[T.SurveyType.CUT_MIN], sliderRanges[T.SurveyType.CUT_MAX]] :
      [sliderRanges[T.SurveyType.FILL_MIN], sliderRanges[T.SurveyType.FILL_MAX]]),
    (isCut ? sliderDefaultValues[T.VolumeSlider.CUT] : sliderDefaultValues[T.VolumeSlider.FILL]),
    );

    const props: DoubleSliderProps = {
      values: sliderDefaultValues[type],
      min: sliderRanges[isCut ? T.SurveyType.CUT_MIN : T.SurveyType.FILL_MIN],
      max: sliderRanges[isCut ? T.SurveyType.CUT_MAX : T.SurveyType.FILL_MAX],
      customStyles: {
        rootStyle: {
          ...defaultSliderRootStyle,
        },
        unfilledBarStyle: {
          background: 'unset',
        },
        filledBarStyle: {
          ...getFilledBarStyle[type](calcMethod),
          opacity: backgroundOpacity,
        },
        thumbStyle: defaultMarkerStyle,
      },
      onChange: isCut ? handleCutSliderChange : handleFillSliderChange,
    };

    const leftInformation: ReactNode = isCut ?
      sliderInformation(T.SurveyType.CUT_MIN) : sliderInformation(T.SurveyType.FILL_MIN);
    const rightInformation: ReactNode = isCut ?
      sliderInformation(T.SurveyType.CUT_MAX) : sliderInformation(T.SurveyType.FILL_MAX);

    return isValid ? (
      <div data-testid={isCut ? 'survey-dsm-item-cutslider' : 'survey-dsm-item-fillslider'}>
        <DoubleSlider
          {...props}
          gap={GAP}
        />
        <InformationWrapper>
          {leftInformation}
          {rightInformation}
        </InformationWrapper>
      </div>
    ) : undefined;
  };

  const createSlider: (type: T.VolumeSlider) => ReactNode = (type) => {
    const isCut: boolean = type === T.VolumeSlider.CUT;
    const isNoValues: boolean = isElementsZero(
      isCut ? sliderDefaultValues[T.VolumeSlider.CUT] : sliderDefaultValues[T.VolumeSlider.FILL],
    );

    const graphContent: ReactNode = isNoValues ? (
      <NoGraphSliderSection>
        {l10n(Text.hasNoValues[type])}
      </NoGraphSliderSection>
    ) : (
      <GraphSliderSection>
        <SliderWrapper hasMargin={isCut}>
          {createDoubleSlider(type)}
        </SliderWrapper>
      </GraphSliderSection>
    );

    const graphTooltipStr: string = calcMethod === T.VolumeCalcMethod.DESIGN ?
      l10n(Text.title.tooltip[T.VolumeCalcMethod.DESIGN][type]) : l10n(Text.title.tooltip[T.VolumeCalcMethod.SURVEY][type]);

    return (
      <>
        <SliderTitleWrapper>
          <CutFillTitle>
            {isCut ? l10n(Text.title.cut) : l10n(Text.title.fill)}
          </CutFillTitle>
          <TooltipWrapper>
            <WrapperHoverable
              title={graphTooltipStr}
              customStyle={tooltipCustomStyle}
            >
              <QuestionMarkSVG />
            </WrapperHoverable>
          </TooltipWrapper>
        </SliderTitleWrapper>
        <Spliter />
        {graphContent}
      </>
    );
  };

  const submitButton: ReactNode = !_.isEqual(memo, dsmInfo) ? (
    <SubmitButton
      data-testid={'survey-dsm-item-submit'}
      onClick={handleSubmit}
    >
      {l10n(Text.submit)}
    </SubmitButton>
  ) : undefined;

  /* eslint-disable no-magic-numbers */
  return (
    <Root>
      <SpliterBottom />
      <ToggleButtonSection>
        <ToggleText isIn3D={isIn3D}>
          {l10n(Text.title.cutFillMap)}
        </ToggleText>
        <ToggleContainer isIn3D={isIn3D}>
          <MiniToggleButton
            height={16}
            width={29}
            isRight={isIn3D ? false : dsmInfo.isOn}
            onChange={changeToggle}
          />
        </ToggleContainer>
      </ToggleButtonSection>
      <ToggleContentSection isVisible={isIn3D ? false : dsmInfo.isOn}>
        <OpacitySection>
          <TitleSection>
            <div>
              {l10n(Text.title.opacity)}
            </div>
            <TitleRight>
              {`${opacityValue}%`}
            </TitleRight>
          </TitleSection>
          <SliderWrapper>
            <SingleSlider
              minValue={0}
              maxValue={100}
              value={memo.opacity}
              onChange={handleOpacity}
            />
          </SliderWrapper>
        </OpacitySection>
        <GraphSliderSection>
          {createSlider(T.VolumeSlider.CUT)}
          {createSlider(T.VolumeSlider.FILL)}
        </GraphSliderSection>
        {submitButton}
      </ToggleContentSection>
    </Root>
  );
};

export default ReactMemo(ContentsListSurveyDSMItem, arePropsEqual);
