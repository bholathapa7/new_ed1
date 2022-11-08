import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';

import ErrorSvg from '^/assets/icons/permission-popup/error.svg';
import { ConfirmButton } from '^/components/atoms/Buttons';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import Popup from '^/components/molecules/Popup';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { PermissionRole } from '^/types';
import { l10n } from '^/utilities/l10n';
import Text from './text';

const SVGWrapper = styled.svg({
  position: 'absolute',
  top: '2px',
  left: '50%',
  transform: 'translate(-50%, -100%)',
});

const Body = styled.div({
  position: 'relative',
  padding: '7px 50px 50px 50px',
});
Body.displayName = 'Body';

const WarningMessage = styled.p({
  width: '100%',
  marginBottom: '35px',
  color: dsPalette.title.toString(),
  textAlign: 'center',
  fontSize: '15px',
  fontWeight: 'bold',
});
WarningMessage.displayName = 'WarningMessage';

const Description = styled.p({
  width: '100%',
  marginBottom: '10px',
  color: dsPalette.title.toString(),
  textAlign: 'left',
  fontSize: '14px',
});
Description.displayName = 'Description';

const UserRoleName = styled.div({
  boxSizing: 'border-box',
  display: 'inline-block',
  minWidth: '47px',
  padding: '7px',
  marginRight: '8px',
  border: `1px solid ${palette.UploadPopup.inputBorder.toString()}`,
  borderRadius: '5px',
  fontSize: '11px',
  fontWeight: 500,
  textAlign: 'center',
});

const UserRoleSection = styled.div({
  fontSize: '11px',
  color: palette.textGray.toString(),
  whiteSpace: 'nowrap',
});
const UserRoleWrapper = styled.div({
  display: 'inline-block',
  'div + div': { marginTop: '6px' },
});

const ButtonWrapper = styled.div({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '35px',
});


export interface Props {
  readonly zIndex: number;
  onClose(): void;
}

const NoPermissionPopup: FC<Props & L10nProps> = ({ zIndex, onClose, language }) => {
  const backgroundAlpha: number = 0.45;
  const userRoleSectionList: ReactNode = Object.values(PermissionRole).map((role) => (
    <UserRoleSection key={role}>
      <UserRoleName>{l10n(Text.roles[role], language)}</UserRoleName>
      {l10n(Text[role], language)}
    </UserRoleSection>
  ));

  return (
    <Popup alpha={backgroundAlpha} title='' zIndex={zIndex} onCloseClick={onClose}>
      <Body>
        <SVGWrapper width='33px' height='33px'><ErrorSvg /></SVGWrapper>
        <WarningMessage>
          {l10n(Text.authorization, language)}
        </WarningMessage>
        <Description>
          {l10n(Text.description, language)}
        </Description>
        <UserRoleWrapper>
          {userRoleSectionList}
        </UserRoleWrapper>
        <ButtonWrapper>
          <ConfirmButton onClick={onClose} data-testid='confirm-button'>
            {l10n(Text.submit, language)}
          </ConfirmButton>
        </ButtonWrapper>
      </Body>
    </Popup>
  );
};
export default withL10n(NoPermissionPopup);
