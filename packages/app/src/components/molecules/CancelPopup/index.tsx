import React, { FC } from 'react';
import styled from 'styled-components';

import { ConfirmButton } from '^/components/atoms/Buttons';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import Popup from '^/components/molecules/Popup';
import dsPalette from '^/constants/ds-palette';
import { l10n } from '^/utilities/l10n';
import Text from './text';

const Root = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  width: '313px',
  padding: '50px',
  paddingTop: '35px',
  paddingBottom : '35px',
});

const Description = styled.h2({
  display: 'block',
  width: '100%',

  marginBottom: '35px',
  lineHeight: 1.6,
  fontSize: '16px',
  fontWeight: 'normal',
  color: dsPalette.title.toString(),
});

export interface Props {
  readonly zIndex: number;
  onClose(): void;
}

const backgroundAlpha: number = 0.45;

/**
 * @desc Popup for notifying request is canceled.
 */
const CancelPopup: FC<Props & L10nProps> = (props) => (
  <Popup
    title={l10n(Text.title, props.language)}
    alpha={backgroundAlpha}
    zIndex={props.zIndex}
    onCloseClick={props.onClose}
  >
    <Root>
      <Description>
        {l10n(Text.description, props.language)}
      </Description>
      <ConfirmButton onClick={props.onClose} data-testid='confirm-button'>
        {l10n(Text.confirm, props.language)}
      </ConfirmButton>
    </Root>
  </Popup>
);
export default withL10n(CancelPopup);
