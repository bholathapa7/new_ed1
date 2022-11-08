import React, { ReactNode, SyntheticEvent, FC, useRef } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';
import { MediaQuery } from '^/constants/styles';

import * as T from '^/types';

import { l10n } from '^/utilities/l10n';

import ProfileSvg from '^/assets/icons/profile.svg';
import DDMSmallButton from '^/components/atoms/DDMSmallButton';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import Text from './text';

const Root = styled.li({
  display: 'flex',
  alignItems: 'center',

  boxSizing: 'border-box',

  width: '100%',
  marginBottom: '40px',
  padding: '34px 40px',
  [MediaQuery[T.Device.MOBILE_L]]: {
    padding: '20px 28px',
  },
  [MediaQuery[T.Device.MOBILE_S]]: {
    padding: '20px 20px',
  },

  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: palette.border.toString(),
  borderRadius: '3px',
});

const AvatarWrapper = styled.div({
  display: 'inline-block',

  overflow: 'hidden',
  width: '100px',
  minWidth: '100px',
  height: '100px',
  borderRadius: '50%',
  [MediaQuery[T.Device.MOBILE_L]]: {
    minWidth: '80px',
  },
  [MediaQuery[T.Device.MOBILE_S]]: {
    height: '80px',
    width: '80px',
  },

  backgroundColor: palette.icon.toString(),
});

const ProfileContentWrapper = styled.form({
  display: 'inline-block',

  marginLeft: '33px',
  [MediaQuery[T.Device.MOBILE_S]]: {
    marginLeft: '22px',
  },
});

const ProfileName = styled.p({
  fontSize: '17px',
  lineHeight: 1,
  fontWeight: 500,
  color: palette.textGray.toString(),
});

const ProfileEmail = styled.p({
  marginTop: '9px',

  fontSize: '13px',
  lineHeight: 1,
  fontWeight: 'normal',
  color: palette.textGray.toString(),
});

const ProfileButtonWrapper = styled.div({
  display: 'block',

  marginTop: '15px',
});

const ProfileRevertButton = styled(DDMSmallButton)({
  width: 'auto',

  marginRight: '10px',
  paddingLeft: '17px',
  paddingRight: '17px',
});

ProfileRevertButton.displayName = 'ProfileRevertButton';


const ProfileChangeButton = styled(ProfileRevertButton).attrs({
  as: 'label',
})({
  '> input': {
    display: 'none',
  },
});

const UserAvatarSVGWrapper = styled.svg({
  width: '100%',
  height: '100%',
  fill: palette.background.toString(),
});

const UserAvatarImg = styled.img.attrs({
  alt: 'user-avatar',
})({
  width: '100%',
  height: '100%',
});

ProfileChangeButton.displayName = 'ProfileChangeButton';

export interface Props {
  readonly user: T.FullUser;
  readonly isAvatarEdited: boolean;
  onChange(file?: File, url?: string): void;
}

/**
 * @author Joon-Mo Yang <jmyang@angelswing.io>
 * @desc project page mypage tab profile box
 */
const MypageProfile: FC<Props & L10nProps> = ({
  isAvatarEdited, user, language, onChange,
}) => {
  const formRef = useRef<HTMLFormElement>(null);

  const handleAvatarChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    if (event.currentTarget.files !== null && event.currentTarget.files.length !== 0) {
      const avatar: File = event.currentTarget.files[0];
      const reader: FileReader = new FileReader();
      reader.addEventListener('load', () => {
        if (typeof reader.result !== 'string') {
          throw new Error('reader.result in MypageProfile is not string');
        }
        onChange(avatar, reader.result);
      });
      reader.readAsDataURL(avatar);
    }
  };

  const handleAvatarClear = (): void => {
    onChange(undefined, undefined);

    if (formRef.current !== null) {
      formRef.current.reset();
    }
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault();
  };

  const name: string = language === T.Language.KO_KR ?
    `${user.lastName} ${user.firstName}` :
    `${user.firstName} ${user.lastName}`;
  /**
   * @todo remove this Svg wrapper to prevent
   * an accidental scale change
   */

  const avatarImage: ReactNode =
    user.avatar !== undefined ? (
      <UserAvatarImg src={user.avatar} />
    ) : (
      <UserAvatarSVGWrapper>
        <ProfileSvg />
      </UserAvatarSVGWrapper>
    );

  const revertButton: ReactNode = isAvatarEdited ? (
    <ProfileRevertButton onClick={handleAvatarClear} data-testid='profile-revert-button'>
      {l10n(Text.revertAvatar, language)}
    </ProfileRevertButton>
  ) : null;

  return (
    <Root>
      <AvatarWrapper>{avatarImage}</AvatarWrapper>
      <ProfileContentWrapper ref={formRef} onSubmit={handleSubmit}>
        <ProfileName>{name}</ProfileName>
        <ProfileEmail>{user.email}</ProfileEmail>
        <ProfileButtonWrapper>
          <ProfileChangeButton data-testid='profile-change-button'>
            {l10n(Text.changeAvatar, language)}
            <input
              type='file'
              accept='image/jpeg, image/png'
              onChange={handleAvatarChange}
            />
          </ProfileChangeButton>
          {revertButton}
        </ProfileButtonWrapper>
      </ProfileContentWrapper>
    </Root>
  );
};
export default withL10n(MypageProfile);
