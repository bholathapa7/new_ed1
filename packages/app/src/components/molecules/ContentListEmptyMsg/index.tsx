import { UseL10n, useL10n } from '^/hooks';
import React, { FC, memo } from 'react';
import styled from 'styled-components';

import EmptyMapSvg from '^/assets/icons/contents-list/empty-map.svg';
import EmptyMeasurementSvg from '^/assets/icons/contents-list/empty-measurement.svg';
import EmptyOverlaySvg from '^/assets/icons/contents-list/empty-overlay.svg';
import palette from '^/constants/palette';
import * as T from '^/types';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import Text from './text';

const Root = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
});

const SvgWrapper = styled.div({
  position: 'absolute',
  transform: 'translateY(-100%)',
  marginBottom: '20px',
});

const TextWrapper = styled.div({
  fontSize: '12px',
  lineHeight: '18.5px',
  color: palette.hoverUploadIcon.toString(),
  textAlign: 'center',
  padding: '0 64px',
});

export interface Props {
  readonly currentTab: T.ContentPageTabType;
}

const ContentListEmptyMsg: FC<Props> = ({ currentTab }) => {
  const [l10n]: UseL10n = useL10n();

  const [CurrentSvg, currentText]: [FC, string] = (() => {
    switch (currentTab) {
      case T.ContentPageTabType.MAP:
        return [EmptyMapSvg, l10n(Text.emptyMap)];
      case T.ContentPageTabType.MEASUREMENT:
        return [EmptyMeasurementSvg, l10n(Text.emptyMeasurement)];
      case T.ContentPageTabType.OVERLAY:
        return [EmptyOverlaySvg, l10n(Text.emptyOverlay)];
      case T.ContentPageTabType.PHOTO:
      case T.ContentPageTabType.ESS:
        return '';
      default:
        exhaustiveCheck(currentTab);
    }
  })() as [FC, string];

  return (
    <Root>
      <SvgWrapper>
        <CurrentSvg />
      </SvgWrapper>
      <TextWrapper>{currentText}</TextWrapper>
    </Root>
  );
};

export default memo(ContentListEmptyMsg);
