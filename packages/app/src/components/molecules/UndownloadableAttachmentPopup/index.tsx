import React, { FC } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

import BreakLineText from '^/components/atoms/BreakLineText';
import { ConfirmButton as RawConfirmButton } from '^/components/atoms/Buttons';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import Popup from '^/components/molecules/Popup';
import { l10n } from '^/utilities/l10n';
import Text from './text';

const ConfirmButton = styled(RawConfirmButton)({
  margin: 'auto',
  display: 'block',
});

const Body = styled.div({
  width: '260px',

  padding: '50px',
});
Body.displayName = 'Body';

const Description = styled.p({
  marginBottom: '35px',

  width: '100%',

  textAlign: 'center',
  lineHeight: 1.6,
  fontSize: '15px',
  fontWeight: 500,
  color: palette.textBlack.toString(),
});
Description.displayName = 'Description';

export interface Props {
  readonly zIndex: number;
  onClose(): void;
}

/**
 * @author Junyoung Clare Jang
 * @desc Thu Apr  5 18:38:16 2018 UTC
 */
const UndownloadableAttachmentPopup: FC<Props & L10nProps> = (
  { zIndex, onClose, language },
) => {
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
          <BreakLineText>
            {l10n(Text.description, language)}
          </BreakLineText>
        </Description>
        <ConfirmButton onClick={onClose}>
          {l10n(Text.submit, language)}
        </ConfirmButton>
      </Body>
    </Popup>
  );
};
export default withL10n(UndownloadableAttachmentPopup);
