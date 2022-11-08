import React, { FC } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

import { ConfirmButton as RawConfirmButton } from '^/components/atoms/Buttons';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import Popup from '^/components/molecules/Popup';
import { l10n } from '^/utilities/l10n';
import Text from './text';

const Body = styled.div({
  width: '320px',

  padding: '50px',
});
Body.displayName = 'Body';

const Description = styled.p({
  marginBottom: '30px',

  width: '100%',

  textAlign: 'center',
  lineHeight: 1.6,
  fontSize: '15px',
  fontWeight: 300,
  color: palette.textBlack.toString(),
});
Description.displayName = 'Description';

const ConfirmButton = styled(RawConfirmButton)({
  margin: 'auto',
  display: 'block',
});
export interface Props {
  readonly zIndex: number;
  onClose(): void;
}

/**
 * @author Junyoung Clare Jang
 * @desc Fri Apr  6 19:46:21 2018 UTC
 */
const UserUpdateSuccessPopup: FC<Props & L10nProps> = ({
  zIndex, onClose, language,
}) => {
  const backgroundAlpha: number = 0.45;

  return (
    <Popup
      alpha={backgroundAlpha}
      title={l10n(Text.title, language)}
      zIndex={zIndex}
      onCloseClick={onClose}
    >
      <Body>
        <Description>
          {l10n(Text.description, language)}
        </Description>
        <ConfirmButton onClick={onClose}>
          {l10n(Text.submit, language)}
        </ConfirmButton>
      </Body>
    </Popup>
  );
};

export default withL10n(UserUpdateSuccessPopup);
