import React, { FC, ReactNode, memo, useMemo } from 'react';
import styled, { CSSObject } from 'styled-components';

import QuestionSVG from '^/assets/icons/contents-list/question-mark.svg';
import { ImperialMeasurementUnit } from '^/components/atoms/ImperialMeasurementUnit';
import LoadingIcon from '^/components/atoms/LoadingIcon';
import { MeasurementUnit } from '^/components/atoms/MeasurementUnit';
import WrapperHoverable, {
  Props as WrapperHoverableProps,
} from '^/components/atoms/WrapperHoverable';
import dsPalette from '^/constants/ds-palette';
import { FontFamily } from '^/constants/styles';
import * as T from '^/types';
import { arePropsEqual } from '^/utilities/react-util';


const IconsContainer = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '10px',
});

const SvgContainer = styled.div({
  width: '42px',
});

const InfoContainer = styled.div({
  width: '12px',
  height: '16px',
  display: 'flex',
  alignItems: 'center',
  marginLeft: '3px',
});

const HeadingTitle = styled.span({
  fontSize: '13px',
  lineHeight: '16px',
  color: dsPalette.typePrimary.toString(),
  fontWeight: 500,
});

const LoadingContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  color: 'var(--color-theme-primary)',
});

const ValueStyle: CSSObject = {
  fontFamily: FontFamily.ROBOTO,
  fontSize: '18px',
  fontWeight: 500,
};

const Value = styled.span({
  ...ValueStyle,
  color: 'var(--color-theme-primary)',
});

const Root = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '15px',
  boxSizing: 'border-box',
  position: 'relative',
  height: '85px',
  width: '100%',
  borderRadius: '4px',
  border: '1px solid transparent',

  '&.active': {
    boxShadow: '2px 2px 7px 0px rgba(0,0,0,0.15)',
  },
});

const loadingIconCustomStyle: CSSObject = {
  width: '16px',
  height: '16px',

  borderWidth: '2px',
};

const getTooltipCustomStyle: (customStyle?: CSSObject) => WrapperHoverableProps['customStyle'] = (customStyle = {}) => ({
  tooltipWrapperStyle: {
    position: 'relative',
    fontSize: '10px',
    display: 'inline-block',
    textAlign: 'center',
  },
  tooltipBalloonStyle: {
    width: '140px',
    maxWidth: 'unset',
    left: '50%',
    transform: 'translate(-50%, 3px)',
    bottom: 'auto',
    padding: '5px',
    ...customStyle,
  },
  tooltipTextTitleStyle: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.25,
  },
});

export const MetricsContainer = styled.div({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  marginTop: '15px',
});


export interface Props {
  readonly type: T.MeasurementContent['type'];
  readonly title: string;
  readonly tooltip: string;
  readonly icon: any;
  readonly value: string | undefined;
  readonly isActive?: boolean;
  readonly tooltipCustomStyle?: CSSObject;
  readonly unitType: T.ValidUnitType;
}

const MetricList: FC<Props> = ({ type, title, tooltip, icon, value, isActive, tooltipCustomStyle, unitType }) => {
  const measurementUnit: ReactNode = useMemo(() => (
    <MeasurementUnit type={type} unitCustomStyle={{ ...ValueStyle, paddingLeft: '5px' }} />
  ), [type]);

  const imperialMeasurementUnit: ReactNode = useMemo(() => (
    <ImperialMeasurementUnit type={type} unitCustomStyle={{ ...ValueStyle, paddingLeft: '5px' }} />
  ), [type]);

  const metricContent: ReactNode = useMemo(() => {
    if (value === undefined) {
      return (
        <LoadingContainer>
          <LoadingIcon loadingDivCustomStyle={loadingIconCustomStyle} />
          {unitType === T.UnitType.IMPERIAL ? imperialMeasurementUnit : measurementUnit}
        </LoadingContainer>
      );
    }

    if (value === '-') {
      return <Value>-</Value>;
    }

    return (
      <Value>
        {value}{unitType === T.UnitType.IMPERIAL ? imperialMeasurementUnit : measurementUnit}
      </Value>
    );
  }, [measurementUnit, value]);

  return (
    <Root className={isActive ? 'active' : ''}>
      <IconsContainer>
        <SvgContainer>
          {icon}
        </SvgContainer>
        <HeadingTitle>{title}</HeadingTitle>
        <WrapperHoverable
          title={tooltip}
          customStyle={getTooltipCustomStyle(tooltipCustomStyle)}
        >
          <InfoContainer>
            <QuestionSVG />
          </InfoContainer>
        </WrapperHoverable>
      </IconsContainer>
      {metricContent}
    </Root>
  );
};

export default memo(MetricList, arePropsEqual);
