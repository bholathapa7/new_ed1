import React, { FC } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

import { l10n } from '^/utilities/l10n';

import { ConfirmButton as RawConfirmButton } from '^/components/atoms/Buttons';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import Popup from '^/components/molecules/Popup';

import Text from './text';

const ConfirmButton = styled(RawConfirmButton)({
  margin: 'auto',
  display: 'block',
});

const Root = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  minWidth: '260px',
  padding: '50px',

  whiteSpace: 'nowrap',
});

const Description = styled.h2({
  display: 'block',

  marginBottom: '35px',

  fontSize: '15px',
  lineHeight: 1,
  fontWeight: 'normal',
  color: palette.textBlack.toString(),
});

export interface Props {
  readonly zIndex: number;
  onClose(): void;
}

const backgroundAlpha: number = 0.45;

/**
 * @author Joon-Mo Yang <jmyang@angelswing.io>
 * @desc Popup for notifying source photo upload complete
 */
const SourceErrorPopup: FC<Props & L10nProps> = (props) => (
  <Popup
    title={l10n(Text.title, props.language)}
    alpha={backgroundAlpha}
    zIndex={props.zIndex}
    onCloseClick={props.onClose}
  >
    <Root>
      <Description>{l10n(Text.description, props.language)}</Description>
      <ConfirmButton onClick={props.onClose}>
        {l10n(Text.submit, props.language)}
      </ConfirmButton>
    </Root>
  </Popup>
);
export default withL10n(SourceErrorPopup);
