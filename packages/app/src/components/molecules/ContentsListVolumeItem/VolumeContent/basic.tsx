import React, { FC, ReactNode, SyntheticEvent, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import QuestionMarkSvg from '^/assets/icons/question-mark.svg';
import { SubmitButton as RawSubmitButton } from '^/components/atoms/Buttons';
import WrapperHoverable, { Props as WrapperHoverableProps } from '^/components/atoms/WrapperHoverable';
import VolumeAlgorithmDropdown from '^/components/organisms/VolumeAlgorithmDropdown';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { FontFamily } from '^/constants/styles';
import { UseL10n, UseState, useL10n } from '^/hooks';
import { RequestVolumeCalculation } from '^/store/duck/Contents';
import * as T from '^/types';
import Text from './text';


const HeaderWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

interface ItemWrapperProps {
  margin?: 'top' | 'bottom';
}
const ItemWrapper = styled.div<ItemWrapperProps>(({ margin }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginTop: margin === 'top' ? '10px' : '0px',
  marginBottom: margin === 'bottom' ? '10px' : '0px',
}));
const TitleWrapper = styled.div({
  display: 'flex',
});
const Title = styled.span({
  fontSize: '12px',
  color: dsPalette.title.toString(),
});
const ElevationInputWrapper = styled.div({
  display: 'flex',
  alignItems: 'flex-end',
  color: dsPalette.title.toString(),
  fontFamily: FontFamily.ROBOTO,
  fontSize: '13px',
});
const SubmitButton = styled(RawSubmitButton)({
  marginTop: '10px',
});
const ElevationInput = styled.input.attrs({
  type: 'number',
})({
  border: `solid 1px ${palette.ContentsList.inputBorder.toString()}`,
  marginRight: '3px',
  borderRadius: '5px',
  width: '65px',
  height: '29px',

  textAlign: 'center',
  color: 'var(--color-theme-primary-lighter)',
  fontWeight: 500,
  fontSize: '12px',
  fontFamily: FontFamily.ROBOTO,

  // Firefox support
  '-moz-appearance': 'textfield',
  '::-webkit-inner-spin-button': {
    margin: 0,
    appearance: 'none',
  },
});
const ButtonWrapper = styled.div({
  display: 'flex',
  width: '100%',
  justifyContent: 'center',
});


const tooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: {
    position: 'relative',
    display: 'inline-block',
  },
  tooltipTargetStyle: {
    display: 'flex',
    justifyContent: 'center',

    marginLeft: '3px',
  },
  tooltipBalloonStyle: {
    bottom: 'unset',
    top: 'calc(100% + 3px)',
    left: '100%',

    transform: 'translateX(-50%)',

    width: '172px',
    maxWidth: 'unset',
  },
  tooltipTextTitleStyle: {
    whiteSpace: 'pre-wrap',
    fontSize: '12px',
    lineHeight: 1.25,
    wordBreak: 'keep-all',
  },
};

interface Props {
  content: T.VolumeContent;
}

export const Basic: FC<Props> = ({ content, children }) => {
  const volumeInformation: T.CalculatedVolumeInfo | undefined =
    content.info.calculatedVolume;

  const [l10n]: UseL10n = useL10n();
  const [volumeAlgorithm, setVolumeAlgorithm]: UseState<T.BasicCalcBasePlane> =
    useState(volumeInformation.calculation.volumeAlgorithm);
  const [customElevationValue, setCustomElevationValue]: UseState<number> =
    useState(volumeInformation.calculation.volumeElevation);
  const [isDropdownAlgorithmCustom, setIsDropdownAlgorithmCustom]: UseState<boolean> = useState(
    volumeInformation.calculation.type === T.VolumeCalcMethod.BASIC &&
    volumeInformation.calculation.volumeAlgorithm === T.BasicCalcBasePlane.CUSTOM,
  );
  const dispatch: Dispatch = useDispatch();

  useEffect(() => {
    setVolumeAlgorithm(content.info.calculatedVolume.calculation.volumeAlgorithm);
  }, [content.info.calculatedVolume.calculation.volumeAlgorithm]);

  const onSelect: (
    algorithm?: T.BasicCalcBasePlane, elevation?: number,
  ) => void = (
    algorithm, elevation,
  ) => {
    if (algorithm === undefined) return;
    setVolumeAlgorithm(algorithm);
    setIsDropdownAlgorithmCustom(algorithm === T.BasicCalcBasePlane.CUSTOM);
    dispatch(RequestVolumeCalculation({
      contentId: content.id,
      info: {
        type: T.VolumeCalcMethod.BASIC,
        volumeAlgorithm: algorithm,
        volumeElevation: elevation === undefined ? 0 : elevation,
      },
    }));
  };

  const onElevationInputChange: (e: SyntheticEvent<HTMLInputElement>) => void = (e) => {
    setCustomElevationValue(Number(e.currentTarget.value));
  };

  const onCustomElevationButtonClick: () => void = () => {
    onSelect(volumeAlgorithm, customElevationValue);
  };


  const customElevationConfirm: ReactNode =
    volumeInformation.calculation.volumeElevation !== customElevationValue ? (
      <ButtonWrapper>
        <SubmitButton onClick={onCustomElevationButtonClick}>
          {l10n(Text.submit)}
        </SubmitButton>
      </ButtonWrapper>
    ) : undefined;

  const customElevation: ReactNode = isDropdownAlgorithmCustom ?
    (
      <>
        <ItemWrapper margin='top'>
          <Title>
            {l10n(Text.title.customElevation)}
          </Title>
          <ElevationInputWrapper>
            <ElevationInput
              value={customElevationValue}
              onChange={onElevationInputChange}
            />
            {'m'}
          </ElevationInputWrapper>
        </ItemWrapper>
        {customElevationConfirm}
      </>
    ) : undefined;

  return (
    <>
      <HeaderWrapper>
        <ItemWrapper>
          <TitleWrapper>
            <Title>
              {l10n(Text.title.base)}
            </Title>
            <WrapperHoverable title={l10n(Text.title.tooltipBasePlane)} customStyle={tooltipCustomStyle}>
              <QuestionMarkSvg />
            </WrapperHoverable>
          </TitleWrapper>
          <VolumeAlgorithmDropdown
            content={content}
            onSelect={onSelect}
          />
        </ItemWrapper>
        {customElevation}
        {children}
      </HeaderWrapper>
    </>
  );
};
