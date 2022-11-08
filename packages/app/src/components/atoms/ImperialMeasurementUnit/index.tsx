import React, { FC } from 'react';
import styled, { CSSObject } from 'styled-components';

import { getImperialMeasurementUnitFromGeometryType } from '^/components/ol/contentTypeSwitch';
import { FontFamily } from '^/constants/styles';
import { MeasurementContent } from '^/types';

const Unit = styled.span({
  fontFamily: FontFamily.ROBOTO,
  fontSize: 15,
  fontWeight: 'normal',
  fontStretch: 'normal',
  fontStyle: 'normal',
  lineHeight: 1.67,
  letterSpacing: 'normal',
});


export interface Props {
  type: MeasurementContent['type'];
  unitCustomStyle?: CSSObject;
}

export const ImperialMeasurementUnit: FC<Props> = ({ type, unitCustomStyle }) => (
  <Unit style={unitCustomStyle}>{getImperialMeasurementUnitFromGeometryType({ geometryType: type })}</Unit>
);
