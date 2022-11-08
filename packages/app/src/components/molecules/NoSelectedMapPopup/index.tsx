import React, { FC } from 'react';
import styled from 'styled-components';

import dsPalette from '^/constants/ds-palette';

import { ConfirmButton } from '^/components/atoms/Buttons';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import Popup from '^/components/molecules/Popup';
import { l10n } from '^/utilities/l10n';
import Text from './text';

const Body = styled.div({
  width: '310px',

  padding: '50px',
  paddingTop: '35px',
});
Body.displayName = 'Body';

const Description = styled.p({
  marginBottom: '35px',

  width: '100%',

  fontSize: '16px',
  color: dsPalette.title.toString(),
});
Description.displayName = 'Description';

const ButtonWrapper = styled.div({
  display: 'flex',
  justifyContent: 'center',
});

export interface Props {
  readonly zIndex: number;
  onClose(): void;
}

/**
 * @author Junyoung Clare Jang
 * @desc Tue May  1 20:19:08 2018 UTC
 */
const NoSelectedMapPopup: FC<Props & L10nProps> = ({
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
        <ButtonWrapper>
          <ConfirmButton onClick={onClose}>
            {l10n(Text.submit, language)}
          </ConfirmButton>
        </ButtonWrapper>
      </Body>
    </Popup>
  );
};
export default withL10n(NoSelectedMapPopup);
