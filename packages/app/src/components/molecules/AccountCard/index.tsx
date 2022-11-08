import React, { FC, ReactNode } from 'react';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';

import * as T from '^/types';
import { l10n } from '^/utilities/l10n';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import ProfileSvg from '^/assets/icons/profile.svg';

import FaIcon from '^/components/atoms/FaIcon';
import WrapperHoverable, {
  Props as WrapperHoverableProps,
} from '^/components/atoms/WrapperHoverable';

import Text from './text';

const Root = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  boxSizing: 'border-box',
  width: '100%',
  padding: '10px',
  paddingBottom: '20px',

  backgroundColor: palette.white.toString(),
});

const UserRoleText = styled.span({
  position: 'relative',
  alignSelf: 'flex-start',

  boxSizing: 'border-box',
  padding: '3px',

  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'var(--color-theme-primary-lightest)',
  borderRadius: '3px',

  fontSize: '10px',
  lineHeight: 1,
  fontWeight: 500,
  color: 'var(--color-theme-primary-lightest)',
});

const AvatarWrapper = styled.div({
  overflow: 'hidden',
  marginTop: '3px',
  marginBottom: '12px',
  width: '60px',
  height: '60px',
  borderRadius: '50%',

  backgroundColor: palette.icon.toString(),
});

const NameWrapper = styled.div({
  position: 'relative',
});

const NameText = styled.span({
  fontSize: '15px',
  lineHeight: '20px',
  fontWeight: 500,
  color: palette.textGray.toString(),
});

const SettingsButton = styled.button({
  marginLeft: '5px',
  width: '20px',
  height: '20px',

  borderRadius: '50%',
  backgroundColor: palette.textGray.toString(),

  fontSize: '14px',
  lineHeight: 0,
  color: palette.white.toString(),
  textAlign: 'center',

  cursor: 'pointer',
});

const OrganizationText = styled.span({
  marginTop: '7px',
  fontSize: '13px',
  lineHeight: 1,
  fontWeight: 'normal',
  color: palette.textLight.toString(),
});

const ImageWrapper = styled.img({
  width: '100%',
  height: '100%',
});

const SvgWrapper = styled.svg({
  width: '100%',
  height: '100%',
  fill: palette.background.toString(),
});

const TooltipWrapperStyle: CSSObject = {
  display: 'inline-block',

  position: 'relative',
};

const TooltipBalloonStyle: CSSObject = {
  left: '3px',
};
const TooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: TooltipWrapperStyle,
  tooltipBalloonStyle: TooltipBalloonStyle,
};

export interface Props {
  readonly authedUser?: T.FullUser;
  toMyPage(): void;
}

const AccountCard: FC<Props & L10nProps> = (
  { authedUser, language, toMyPage },
) => {
  if (authedUser === undefined) {
    return null;
  }

  const avatar: ReactNode = authedUser.avatar !== undefined ?
    (<ImageWrapper
      data-testid='profile-img'
      src={authedUser.avatar}
    />) :
    (
      <SvgWrapper>
        <ProfileSvg data-testid='profile-svg' />
      </SvgWrapper>
    );
  const role: T.UserRole = authedUser.role !== null ? authedUser.role : T.UserRole.BASIC;
  const name: string = language === T.Language.KO_KR ?
    `${authedUser.lastName} ${authedUser.firstName}` :
    `${authedUser.firstName} ${authedUser.lastName}`;

  return (
    <Root>
      <UserRoleText>{role.toUpperCase()}</UserRoleText>
      <AvatarWrapper>{avatar}</AvatarWrapper>
      <NameWrapper>
        <NameText>{name}</NameText>
        <WrapperHoverable
          title={l10n(Text.tooltipMyPage, language)}
          customStyle={TooltipCustomStyle}
        >
          <SettingsButton onClick={toMyPage}>
            <FaIcon faNames='cog' fontSize='14px' />
          </SettingsButton>
        </WrapperHoverable>
      </NameWrapper>
      <OrganizationText>{authedUser.organization}</OrganizationText>
    </Root>
  );
};
export default withL10n(AccountCard);
