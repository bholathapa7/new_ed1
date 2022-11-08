import React, { FormEvent, ReactNode, useState, FC, useRef, useEffect } from 'react';
import styled from 'styled-components';

import ProfileSvg from '^/assets/icons/profile.svg';
import DDMSmallButton from '^/components/atoms/DDMSmallButton';
import FaIcon from '^/components/atoms/FaIcon';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import { l10n } from '^/utilities/l10n';

import palette from '^/constants/palette';

import Text from './text';


const AvatarContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',

  margin: '33px 0px',
});

const AvatarImage = styled.img({
  width: '102px',
  height: '102px',

  borderRadius: '50%',
});

const AvatarInput = styled.input({
  display: 'none',
});

const CameraIcon = styled(FaIcon)({
  position: 'absolute',
  bottom: '12px',
  right: '2px',

  padding: '4px',
  borderRadius: '50%',

  backgroundColor: palette.textLight.toString(),

  zIndex: 1,

  fontSize: 14,
  color: palette.white.toString(),
});

const AvatarLabel = styled.label({
  textAlign: 'center',
  position: 'relative',
});

const DefaultAvatarImage = styled(ProfileSvg)({
  height: '102px',
  width: '102px',

  borderRadius: '50%',
  fill: palette.white.toString(),
  backgroundColor: palette.borderLight.toString(),
});

const EditButton = styled(DDMSmallButton)({
  height: '40px',
  width: '53px',

  marginTop: '9.8px',
  marginLeft: '35.9%',
});

const DeleteButton = styled(DDMSmallButton)({
  height: '40px',
  width: '68px',

  marginTop: '9.8px',
  marginLeft: '10px',
});


export interface Props {
  avatar?: File;
  onUpload(file?: File): void;
}

const ProfileImageUploader: FC<Props &L10nProps> = ({
  avatar, language, onUpload,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const avatarUploaded: boolean = Boolean(avatarUrl);

  const handleUpload = (event: FormEvent<HTMLInputElement>): void => {
    const { files }: HTMLInputElement = event.currentTarget;
    if (files !== null &&
        files.length > 0) {
      onUpload(files[0]);
      event.currentTarget.value = '';
    }
  };

  const handleEdit = (): void => {
    if (avatarInputRef.current !== null) {
      avatarInputRef.current.click();
    }
  };

  const handleDelete = (): void => {
    onUpload();
  };

  const profileImage: ReactNode = avatarUploaded ? (
    <AvatarImage src={avatarUrl} />
  ) : (
    <>
      <DefaultAvatarImage />
      <CameraIcon faNames='camera' />
    </>
  );

  const buttons: ReactNode | undefined = avatarUploaded ? (
    <>
      <EditButton onClick={handleEdit}>
        {l10n(Text.edit, language)}
      </EditButton>
      <DeleteButton onClick={handleDelete}>
        {l10n(Text.delete, language)}
      </DeleteButton>
    </>
  ) : undefined;

  useEffect(() => {
    if (avatar === undefined) {
      setAvatarUrl(undefined);
    } else if (avatar instanceof File) {
      const reader: FileReader = new FileReader();

      reader.addEventListener('load', () =>
        setAvatarUrl(reader.result as string)
      );
      reader.readAsDataURL(avatar);
    }
  }, []);

  return (
    <>
      <AvatarContainer>
        <AvatarLabel>
          {profileImage}
          <AvatarInput
            type='file'
            accept='image/jpeg, image/png'
            onChange={handleUpload}
            ref={avatarInputRef}
          />
        </AvatarLabel>
      </AvatarContainer>
      {buttons}
    </>
  );
};

export default withL10n(ProfileImageUploader);
