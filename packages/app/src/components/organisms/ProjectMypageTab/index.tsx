import React, { FC, ReactNode, useState, useEffect } from 'react';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';
import { MediaQuery } from '^/constants/styles';

import * as T from '^/types';

import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { l10n } from '^/utilities/l10n';
import * as V from '^/utilities/validators';

import ApiDetector from '^/components/atoms/ApiDetector';
import { ConfirmButton as RawConfirmButton } from '^/components/atoms/Buttons';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import RawMypageProfile, { Props as ProfileProps } from '^/components/molecules/MypageProfile';
import RawUserInfoDropdownFields, {
  Props as DropdownFieldProps,
} from '^/components/molecules/UserInfoDropdownFields';
import RawUserInfoInputField, {
  Props as InputFieldProps,
} from '^/components/molecules/UserInfoInputField';

import Text from './text';

const Root = styled.div({
  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
  paddingTop: '50px',
  paddingBottom: '50px',
  paddingLeft: '30px',
  paddingRight: '30px',
});

const Title = styled.h1({
  fontSize: '30px',
  lineHeight: 1,
  fontWeight: 'normal',
  color: palette.darkBlack.toString(),
});

const ContentWrapper = styled.div({
  marginTop: '50px',

  width: '100%',
});

const VerticalWrapper = styled.ul({
  display: 'inline-block',

  width: 'calc(50% - 20px)',

  verticalAlign: 'top',
  [MediaQuery[T.Device.MOBILE_L]]: {
    width: '100%',
  },
});

const Divider = styled.div({
  display: 'inline-block',
  width: '40px',
});

const MypageProfile = styled(RawMypageProfile)<ProfileProps>({
  marginBottom: '40px',
});
MypageProfile.displayName = 'MypageProfile';

const UserInfoInputField = styled(RawUserInfoInputField)<InputFieldProps>({
  marginBottom: '40px',
});
UserInfoInputField.displayName = 'UserInfoDropdownField';

const UserInfoDropdownFields = styled(RawUserInfoDropdownFields)<DropdownFieldProps>({
  marginBottom: '40px',
});
UserInfoDropdownFields.displayName = 'UserInfoDropdownFields';

const HiddenInputField = styled.input({
  display: 'none',
});

const UserInfoRootStyle: CSSObject = {
  listStyle: 'none',
  marginBottom: '40px',
};

const UserInfoLabelStyle: CSSObject = {
  fontSize: '15px',
  fontWeight: 500,
};

const SubmitButton = styled(RawConfirmButton)({
  width: '160px',
  height: '58px',
  fontSize: '16px',
  margin: 'auto',
  display: 'block',
});
SubmitButton.displayName = 'SubmitButton';

type DropdownFieldKinds = DropdownFieldProps['kind'];

const validateForm: (
  kind: InputFieldKinds,
) => (
  value: string,
) => V.ValidationResult = (
  kind,
) => (
  value,
) => {
  const maxLengthOfPassword: number = 22;
  const minLengthOfPassword: number = 6;

  switch (kind) {
    case 'password':
      return V.compose(
        V.maxLength(maxLengthOfPassword),
        V.minLength(minLengthOfPassword),
        V.pattern(/^[\x21-\x7E]*$/, 'validCharacter'),
        V.pattern(/^.*[A-Z].*$/),
        V.pattern(/^.*[a-z].*$/),
        V.pattern(/^.*[0-9].*$/),
      )(value);
    case 'passwordConfirmation':
      return V.compose()(value);
    case 'organization':
      return V.compose(V.required())(value);
    case 'contactNumber':
      return V.compose(V.required())(value);
    default:
      return exhaustiveCheck(kind);
  }
};

type InputFieldKinds =
  | 'password'
  | 'passwordConfirmation'
  | 'organization'
  | 'contactNumber';

const validationErrorToMessage: Readonly<Record<InputFieldKinds, Readonly<{
  [key: string]: (language: T.Language) => string;
}>>> = {
  password: {
    required: (language) => l10n(Text.error.password.required, language),
    minLength: (language) => l10n(Text.error.password.minLength, language),
    maxLength: (language) => l10n(Text.error.password.maxLength, language),
    pattern: (language) => l10n(Text.error.password.pattern, language),
    validCharacter: (language) => l10n(Text.error.password.validCharacter, language),
  },
  passwordConfirmation: {
    required: (language) => l10n(Text.error.passwordConfirmation.required, language),
    equalPassword: (language) => l10n(Text.error.passwordConfirmation.equalPassword, language),
  },
  organization: {
    required: (language) => l10n(Text.error.organization.required, language),
  },
  contactNumber: {
    required: (language) => l10n(Text.error.contactNumber.required, language),
  },
};

interface ErrorState {
  password: string | undefined;
  passwordConfirmation: string | undefined;
  organization: string | undefined;
  contactNumber: string | undefined;
}

export interface Props {
  readonly authedUser?: T.FullUser;
  readonly apiStatus: T.APIStatus;
  readonly initFormValues: T.MyPageFormValues;
  submit(formValues: Pick<T.User, 'id'> & T.MyPageFormValues): void;
  onSuccess(): void;
}

/**
 * @author Joon-Mo Yang <jmyang@angelswing.io>
 * @desc project page mypage tab
 */

const ProjectMypageTab: FC<Props & L10nProps> = ({
  authedUser, language, initFormValues, apiStatus, onSuccess, submit,
}) => {
  const [formValues, setFormValues] = useState<T.MyPageFormValues>({
    ...initFormValues,
  });

  const [error, setError] = useState<ErrorState>({
    password: undefined,
    passwordConfirmation: undefined,
    organization: undefined,
    contactNumber: undefined,
  });

  useEffect(() => {
    if (authedUser !== undefined) {
      setFormValues({
        password: '',
        passwordConfirmation: '',
        organization: authedUser.organization,
        contactNumber: authedUser.contactNumber,
        country: authedUser.country,
        purpose: authedUser.purpose,
        language: authedUser.language,
      });
    }
  }, []);

  const handleInputChange: (kind: InputFieldKinds, value: string) => void = (kind, value) => {
    const validationResult: V.ValidationResult = validateForm(kind)(value);
    let inputError: string | undefined;

    if (!validationResult.valid && validationResult.errors.length > 0) {
      const validationError: string = validationResult.errors[0];
      // Special case for password
      if (kind === 'password' && value === '' && validationError === 'minLength') {
        inputError = undefined;
      } else {
        inputError = validationErrorToMessage[kind][validationError](language);
      }
    }

    if (kind === 'passwordConfirmation' && value !== formValues.password) {
      inputError = validationErrorToMessage.passwordConfirmation.equalPassword(language);
    } else if (kind === 'password') {
      if (value !== formValues.passwordConfirmation) {
        setError({
          ...error,
          passwordConfirmation: validationErrorToMessage.passwordConfirmation.equalPassword(language),
        });
      } else {
        setError({
          ...error,
          passwordConfirmation: undefined,
        });
      }
    }

    setFormValues({ ...formValues, [kind]: value });

    setError({ ...error, [kind]: inputError });
  };

  const handleDropdownChange: (kind: DropdownFieldKinds, value: string) => void = (kind, value) => {
    setFormValues({ ...formValues, [kind]: value });
  };

  const handleAvatarChange: (file?: File, url?: string) => void = (file, url) => {
    if (file !== undefined && url !== undefined) {
      setFormValues({
        ...formValues,
        avatar: {
          file,
          url,
        },
      });
    } else {
      setFormValues({
        ...formValues, avatar: undefined,
      });
    }
  };

  const handleSubmit: () => void = () => {
    if (authedUser !== undefined &&
    Object.values(error).every((err) => err === undefined)) {
      submit({ ...formValues, id: authedUser.id });
    }
  };

  const handleSuccess: () => void = () => {
    onSuccess();
  };

  const handleError: () => void = () => {
  };

  if (authedUser === undefined) {
    return null;
  }

  let isAvatarEdited: boolean = false;
  let avatar: string | undefined = authedUser.avatar;

  if (formValues.avatar !== undefined) {
    isAvatarEdited = true;
    avatar = formValues.avatar.url;
  }

  const SpinnerIcon = styled.i.attrs({
    className: 'fa fa-pulse fa-spinner',
  })``;

  const saveButton: ReactNode =
    apiStatus !== T.APIStatus.PROGRESS ? (
      <SubmitButton onClick={handleSubmit} data-testid='submit-button'>
        {l10n(Text.save, language)}
      </SubmitButton>
    ) : (
      <SubmitButton data-testid='submit-button'>
        <SpinnerIcon />
      </SubmitButton>
    );

  return (
    <Root>
      <Title>{l10n(Text.title, language)}</Title>
      <ContentWrapper>
        <HiddenInputField type='email' />
        <HiddenInputField type='password' />
        <VerticalWrapper>
          <MypageProfile
            user={{ ...authedUser, avatar }}
            isAvatarEdited={isAvatarEdited}
            onChange={handleAvatarChange}
          />
          <UserInfoInputField
            rootStyle={UserInfoRootStyle}
            labelStyle={UserInfoLabelStyle}
            kind='contactNumber'
            value={formValues.contactNumber}
            error={error.contactNumber}
            onChange={handleInputChange}
          />
          <UserInfoDropdownFields
            rootStyle={UserInfoRootStyle}
            labelStyle={UserInfoLabelStyle}
            kind='country'
            value={formValues.country}
            onChange={handleDropdownChange}
          />
          <UserInfoDropdownFields
            rootStyle={UserInfoRootStyle}
            labelStyle={UserInfoLabelStyle}
            kind='language'
            value={formValues.language}
            onChange={handleDropdownChange}
          />
        </VerticalWrapper>
        <Divider />
        <VerticalWrapper>
          <UserInfoInputField
            rootStyle={UserInfoRootStyle}
            labelStyle={UserInfoLabelStyle}
            kind='password'
            value={formValues.password}
            error={error.password}
            onChange={handleInputChange}
          />
          <UserInfoInputField
            rootStyle={UserInfoRootStyle}
            labelStyle={UserInfoLabelStyle}
            kind='passwordConfirmation'
            value={formValues.passwordConfirmation}
            error={error.passwordConfirmation}
            onChange={handleInputChange}
          />
          <UserInfoInputField
            rootStyle={UserInfoRootStyle}
            labelStyle={UserInfoLabelStyle}
            kind='organization'
            value={formValues.organization}
            error={error.organization}
            onChange={handleInputChange}
          />
          <UserInfoDropdownFields
            rootStyle={UserInfoRootStyle}
            labelStyle={UserInfoLabelStyle}
            kind='purpose'
            value={formValues.purpose}
            onChange={handleDropdownChange}
          />
        </VerticalWrapper>
      </ContentWrapper>
      {saveButton}

      <ApiDetector
        status={apiStatus}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </Root>
  );
};
export default withL10n(ProjectMypageTab);
