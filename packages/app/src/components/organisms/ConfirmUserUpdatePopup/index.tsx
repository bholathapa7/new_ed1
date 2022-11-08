import React, { FC, FormEvent, ReactNode, useEffect, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Dispatch } from 'redux';
import { useDispatch, useSelector } from 'react-redux';

import ProfileSvg from '^/assets/icons/profile.svg';
import ApiDetector from '^/components/atoms/ApiDetector';
import { ConfirmButton } from '^/components/atoms/Buttons';
import DDMInput from '^/components/atoms/DDMInput/1';
import Popup from '^/components/molecules/Popup';
import palette from '^/constants/palette';
import { MediaQuery } from '^/constants/styles';
import { CancelPatchUserInfo, PatchUserInfo, PatchUserInfoBody } from '^/store/duck/Users';
import * as T from '^/types';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import Text from './text';
import { useL10n, UseL10n, UseState } from '^/hooks';
import { useAuthedUser } from '^/hooks/useAuthedUser';
import { ChangeLanguage, CloseProjectPagePopup, OpenProjectPagePopup } from '^/store/duck/Pages';

const Body = styled.div({
  padding: '30px',
  paddingBottom: '50px',
});

const Description = styled.p({
  fontSize: '15px',
  color: palette.textBlack.toString(),
});

const PasswordForm = styled.form({
  marginTop: '35px',
});
PasswordForm.displayName = 'PasswordForm';

const AvatarWrapper = styled.div({
  display: 'inline-block',
  marginRight: '30px',
  verticalAlign: 'middle',

  width: '80px',
  height: '80px',

  borderRadius: '50%',
  backgroundColor: palette.icon.toString(),

  overflow: 'hidden',
});

const HiddenInputField = styled.input({
  display: 'none',
});

const PasswordField = styled.div({
  display: 'inline-block',
  verticalAlign: 'middle',
});

const PasswordLabel = styled.label({
  display: 'block',
});

const PasswordLabelText = styled.div({
  marginBottom: '15px',
});

const PasswordInput = styled(DDMInput)({
  width: '470px',

  [MediaQuery[T.Device.MOBILE_L]]: {
    width: '400px',
  },
  [MediaQuery[T.Device.MOBILE_S]]: {
    width: '300px',
  },
});
PasswordInput.displayName = 'PasswordInput';

const ErrorDisplay = styled.div({
  marginTop: '10px',

  fontSize: '14px',
  color: palette.error.toString(),
});

const SubmitButton = styled(ConfirmButton)({
  display: 'block',
  margin: 'auto',
  marginTop: '50px',
});
SubmitButton.displayName = 'SubmitButton';

const ProgressSpinner = styled.i.attrs({
  className: 'fa fa-spinner fa-pulse fa-fw',
})({});

const UserAvatarSVGWrapper = styled.svg({
  width: '100%',
  height: '100%',
  fill: palette.background.toString(),
});

const UserAvatarImg = styled.img.attrs<{ src: string }>(({ src }) => ({
  src,
  alt: 'user-avatar',
}))({
  width: '100%',
  height: '100%',
});
export interface Props {
  readonly zIndex: number;
}

const POPUP_ALPHA: number = 0.45;

const handleError: () => void = () => {
  /**
   * @todo Add other error handling?
   */
};

const ConfirmUserUpdatePopup: FC<Props> = ({ zIndex }) => {
  const [l10n]: UseL10n = useL10n();
  const dispatch: Dispatch = useDispatch();
  const [password, setPassword]: UseState<string> = useState('');

  const authedUser: T.User | undefined = useAuthedUser();
  const myPageFormValues = useSelector((state: T.State) => state.Pages.Project.myPageFormValues);
  const patchUserStatus = useSelector((state: T.State) => state.Users.patchUserInfoStatus);
  const patchUserError = useSelector((state: T.State) => state.Users.patchUserInfoError);

  const cancelSubmit: () => void = useCallback(() => {
    dispatch(CancelPatchUserInfo());
  }, []);

  useEffect(() => cancelSubmit, []);

  const onClose: () => void = useCallback(() => {
    dispatch(CloseProjectPagePopup());
  }, []);

  const onSuccess: () => void = useCallback(() => {
    dispatch(CloseProjectPagePopup());
    dispatch(OpenProjectPagePopup({ popup: T.ProjectPagePopupType.USER_UPDATE_SUCCESS }));
  }, []);

  const handlePasswordChange: (event: FormEvent<HTMLInputElement>) => void = useCallback((event) => {
    setPassword(event.currentTarget.value);
  }, []);

  const handleSubmit: (event: FormEvent<HTMLFormElement>) => void = (event) => {
    if (!authedUser) return;

    event.preventDefault();

    const formValues: Pick<T.User, 'id'> & PatchUserInfoBody = {
      ...myPageFormValues,
      id: authedUser.id,
      currentPassword: password,
      avatar: myPageFormValues.avatar !== undefined ?
        myPageFormValues.avatar.file :
        undefined,
    };

    dispatch(PatchUserInfo({
      user: formValues,
    }));

    if (formValues.language !== undefined) {
      dispatch(ChangeLanguage({
        language: formValues.language,
      }));
    }
  };

  /**
   * @todo remove this Svg wrapper to prevent
   * an accidental scale change
   */
  const avatarImageURL: string | undefined =
    myPageFormValues.avatar !== undefined ?
      myPageFormValues.avatar.url :
      authedUser?.avatar;

  const avatarImage: ReactNode = useMemo(() => (
    avatarImageURL !== undefined ?
      <UserAvatarImg src={avatarImageURL} /> : (
        <UserAvatarSVGWrapper>
          <ProfileSvg />
        </UserAvatarSVGWrapper>
      )
  ), [avatarImageURL]);

  const submitButton: ReactNode = useMemo(() => (
    patchUserStatus === T.APIStatus.PROGRESS ? (
      <SubmitButton type='submit' disabled={true}>
        <ProgressSpinner />
      </SubmitButton>
    ) : <SubmitButton type='submit'>{l10n(Text.save)}</SubmitButton>
  ), [patchUserStatus]);

  let withClientError: boolean = false;
  let errorMessage: string | undefined;

  if (patchUserStatus === T.APIStatus.ERROR) {
    switch (patchUserError) {
      case T.HTTPError.CLIENT_ERROR:
      case T.HTTPError.CLIENT_NOT_FOUND_ERROR:
      case T.HTTPError.CLIENT_UNAUTHORIZED_ERROR:
        withClientError = true;
        errorMessage = l10n(Text.error.client);
        break;
      case T.HTTPError.CLIENT_AUTH_ERROR:
        withClientError = true;
        errorMessage = l10n(Text.error.client_auth);
        break;
      case T.HTTPError.SERVER_ERROR:
        errorMessage = l10n(Text.error.server);
        break;
      case T.HTTPError.UNKNOWN_ERROR:
        errorMessage = l10n(Text.error.unknown);
        break;
      case T.HTTPError.CLIENT_OUTDATED_ERROR:
      case T.HTTPError.CLIENT_NOT_ACCEPTED_ERROR:
      case undefined:
        break;
      default:
        exhaustiveCheck(patchUserError);
    }
  }

  const clientErrorDisplay: ReactNode = useMemo(() => (
    withClientError ?
      <ErrorDisplay>{errorMessage}</ErrorDisplay> :
      undefined
  ), [withClientError, errorMessage]);

  const errorDisplay: ReactNode = useMemo(() => (
    errorMessage !== undefined && !withClientError ?
      <ErrorDisplay>{errorMessage}</ErrorDisplay> :
      undefined
  ), [errorMessage, withClientError]);

  return (
    <Popup
      zIndex={zIndex}
      alpha={POPUP_ALPHA}
      title={l10n(Text.title)}
      onCloseClick={onClose}
    >
      <Body>
        <Description>{l10n(Text.description)}</Description>
        <PasswordForm onSubmit={handleSubmit}>
          <AvatarWrapper>{avatarImage}</AvatarWrapper>
          <HiddenInputField type='password' />
          <PasswordField>
            <PasswordLabel>
              <PasswordLabelText>
                {l10n(Text.password.label)}
              </PasswordLabelText>
              <PasswordInput
                type='password'
                error={withClientError}
                placeholder={l10n(Text.password.placeholder)}
                value={password}
                onChange={handlePasswordChange}
              />
              {clientErrorDisplay}
            </PasswordLabel>
          </PasswordField>
          {errorDisplay}
          {submitButton}
        </PasswordForm>
      </Body>
      <ApiDetector
        status={patchUserStatus}
        onSuccess={onSuccess}
        onError={handleError}
      />
    </Popup>
  );
};

export default ConfirmUserUpdatePopup;
