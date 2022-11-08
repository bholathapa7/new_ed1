import React, { FC, ReactNode } from 'react';
import styled, { CSSObject } from 'styled-components';

import DeleteSvg from '^/assets/icons/close.svg';
import ProfileSvg from '^/assets/icons/profile.svg';
import Dropdown, {
  Option as DropdownOption,
  createOptions,
} from '^/components/atoms/Dropdown/1';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import palette from '^/constants/palette';
import { MediaQuery } from '^/constants/styles';
import * as T from '^/types';
import { l10n } from '^/utilities/l10n';
import Text from './text';
import ToggleSwitchButton from '^/components/atoms/ToggleSwitchButton';

const Root = styled.tr({
  [MediaQuery.MOBILE_L]: {
    width: '100%',

    display: 'flex',
    flexDirection: 'column',

    boxSizing: 'border-box',
    backgroundColor: palette.white.toString(),

    padding: '20px',
  },
});

const Column = styled.td.attrs((props: { 'data-th'?: string }) => ({
  'data-th': props['data-th'],
}))({
  paddingTop: '25px',
  paddingBottom: '25px',

  fontSize: '15px',
  lineHeight: 1,
  fontWeight: 'normal',
  color: palette.textLight.toString(),
  textAlign: 'center',

  backgroundColor: palette.white.toString(),

  [MediaQuery.MOBILE_L]: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    paddingTop: '10px',
    paddingBottom: '10px',

    '::before': {
      content: 'attr(data-th)',
      fontWeight: 'bold',
    },
  },
});

const NameColumn = styled(Column)({
  paddingTop: '14px',
  paddingBottom: '14px',
  textAlign: 'left',
  verticalAlign: 'middle',
});
NameColumn.displayName = 'NameColumn';

const NameContent = styled.div({
  display: 'flex',
  direction: 'ltr',
  alignItems: 'center',

  [MediaQuery.MOBILE_L]: {
    width: '100%',
  },
});

const AvatarWrapper = styled.div({
  overflow: 'hidden',
  marginLeft: '15%',
  width: '37px',
  height: '37px',

  borderRadius: '50%',
  backgroundColor: palette.icon.toString(),

  [MediaQuery.MOBILE_L]: {
    marginLeft: 0,
  },
});

const UserAvatarImg = styled.img({
  width: '100%',
  height: '100%',
});

const UserAvatarSVGWrapper = styled.svg({
  width: '100%',
  height: '100%',
  fill: palette.background.toString(),
});

const NameText = styled.span({
  marginLeft: '20px',

  lineHeight: '37px',
  color: palette.textGray.toString(),
});

const textStyle: CSSObject = {
  boxSizing: 'border-box',
  marginLeft: '8px',
  padding: '3px',

  borderWidth: '1px',
  borderStyle: 'solid',
  borderRadius: '3px',

  fontSize: '10px',
  lineHeight: 1,
  fontWeight: 500,
};
const PendingText = styled.span({
  ...textStyle,
  borderColor: palette.subColor.toString(),
  color: palette.subColor.toString(),
});
PendingText.displayName = 'PendingText';

const DeniedText = styled.span({
  ...textStyle,
  borderColor: palette.error.toString(),
  color: palette.error.toString(),
});
DeniedText.displayName = 'DeniedText';

const DeleteIconWrapper = styled.svg({
  width: '14px',
  height: '14px',

  fill: palette.textLight.toString(),

  cursor: 'pointer',
});

const AuthorityContent = styled.div({
  display: 'flex',
  justifyContent: 'center',
});

const permissionOptions: Array<DropdownOption> = createOptions([
  T.PermissionRole.ADMIN,
  T.PermissionRole.MEMBER,
  T.PermissionRole.VIEWER,
  T.PermissionRole.PILOT,
]);

export interface Props {
  readonly user: T.RestrictedUser;
  readonly permission: T.Permission;
  readonly zIndex: number;
  readonly featurePermission: Record<number, T.RestrictedUser>;
  onDelete(): void;
  onPermissionChange(id: T.Permission['id'], role: T.PermissionRole): void;
  onFeaturePermissionChange(id: T.Permission['id'], role: string, isESS: boolean): void;
}

/**
 * Project manage tab permission table item component
 */
const ProjectPermissionItem: FC<Props & L10nProps> = ({
  permission, user, language, zIndex, onDelete, onPermissionChange, onFeaturePermissionChange,
}) => {
  const handlePermissionChange: (option: DropdownOption) => void = (option) => {
    onPermissionChange(permission.id, option.value as T.PermissionRole);
  };

  const handleSwitchChange = (isESS: boolean): void => {
    onFeaturePermissionChange(permission.id, permission.role, isESS);
  };

  const avatar: ReactNode = (
    user.avatar !== undefined ?
      <UserAvatarImg alt='user-avatar' src={user.avatar} /> :
      (
        <UserAvatarSVGWrapper>
          <ProfileSvg />
        </UserAvatarSVGWrapper>
      )
  );
  const statusText: ReactNode = (
    permission.status === T.PermissionStatus.ACCEPTED ?
      undefined :
      (
        permission.status === T.PermissionStatus.PENDING ?
          <PendingText>PENDING</PendingText> :
          <DeniedText>DENIED</DeniedText>
      )
  );
  const name: string = language === T.Language.KO_KR ?
    `${user.lastName} ${user.firstName}` :
    `${user.firstName} ${user.lastName}`;

  return (
    <Root>
      <NameColumn>
        <NameContent>
          <AvatarWrapper>{avatar}</AvatarWrapper>
          <NameText>{name}</NameText>
          {statusText}
        </NameContent>
      </NameColumn>
      <Column data-th={l10n(Text.email, language)}>{user.email}</Column>
      <Column data-th={l10n(Text.team, language)}>{user.organization}</Column>
      <Column data-th={l10n(Text.authority, language)}>
        <AuthorityContent>
          <Dropdown
            options={permissionOptions}
            value={permission.role}
            placeHolder=''
            onClick={handlePermissionChange}
            zIndex={zIndex}
            caretStyle={{ color: palette.textLight.toString() }}
          />
        </AuthorityContent>
      </Column>
      <Column data-th={l10n(Text.featureToggle.ess, language)}>
        <AuthorityContent>
          <ToggleSwitchButton
            value={permission?.features?.ess || false}
            dataId={user.id} onChange={(isESS) => handleSwitchChange(isESS)}
            width={80}
            height={40}
            leftText='I'
            rightText='O'
          />
        </AuthorityContent>
      </Column>
      <Column data-th={l10n(Text.delete, language)}>
        <DeleteIconWrapper onClick={onDelete}>
          <DeleteSvg data-testid='project-permission-item-delete-button' />
        </DeleteIconWrapper>
      </Column>
    </Root>
  );
};
export default withL10n(ProjectPermissionItem);
