/* eslint-disable max-lines */
import { autobind } from 'core-decorators';
import _ from 'lodash-es';
import React, { Component, ReactNode, SyntheticEvent } from 'react';
import { Observable, Subscription } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { catchError, map } from 'rxjs/operators';
import styled, { CSSObject } from 'styled-components';

import { makeV2APIURL } from '^/store/duck/API';
import * as T from '^/types';

import palette from '^/constants/palette';
import dsPalette from '^/constants/ds-palette';
import route from '^/constants/routes';

import { l10n } from '^/utilities/l10n';
import * as V from '^/utilities/validators';

import { NonAuthConfirmButton } from '^/components/atoms/Buttons';
import { CustomColorCheckbox } from '^/components/atoms/CustomColorCheckbox';
import _DDMCheckBox, { Props as DDMCheckBoxProps } from '^/components/atoms/DDMCheckBox';
import LoadingIcon from '^/components/atoms/LoadingIcon';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import UserInfoDropdownFields, {
  UserInfoDropdownFieldsKind,
} from '^/components/molecules/UserInfoDropdownFields';
import UserInfoInputField, {
  UserInfoInputFieldKind,
} from '^/components/molecules/UserInfoInputField';
import ProfileImageUploader from '^/components/organisms/ProfileImageUploader';

import Text from './text';

const UserInfoFieldRootStyle: CSSObject = {
  display: 'block',

  ':not(:first-of-type)': {
    marginTop: '20px',
  },
};

const UserInfoFieldLabelStyle: CSSObject = {
  fontSize: '13px',
  fontWeight: 500,
};

const DDMCheckBoxProp: CSSObject = {
  color: palette.textGray.toString(),
};


const Root =
  styled.div({
    boxSizing: 'border-box',
    width: '100%',

    backgroundColor: palette.white.toString(),

    textAlign: 'left',
  });

const HiddenInput =
  styled.input({
    display: 'none',
  });

const DDMhr =
  styled.hr({
    margin: '40px 0px 30px 0px',

    width: '100%',
  });

const HyperLink =
  styled.a({
    color: 'blue',
    underlineDecorator: 'blue solid 1px',
  });

const DDMCheckBox =
  styled(_DDMCheckBox)<DDMCheckBoxProps>({
    alignItems: 'baseline',
  });

const ErrorMessage =
  styled.p({
    display: 'block',
    marginTop: '10px',

    lineHeight: 1.3,
    fontSize: '14px',
    color: palette.error.toString(),
  });


type TextDictionary = Record<T.Language, string>;

type ValidationResults = Readonly<Record<T.RequiredSignUpFormKeys, V.ValidationResult>>;
/**
 * @todo
 * Extract this as component for input validation
 */

const validateForm: (formValues: T.RequiredSignUpFormValues) => ValidationResults = ({
  email,
  password, passwordConfirmation,
  firstName, lastName,
  organization, contactNumber,
  country, purpose,
  language, eula,
}) => {
  const maxLengthOfPassword: number = 22;
  const minLengthOfPassword: number = 6;

  return {
    email: V.compose(
      V.required(),
      V.emailValidator,
    )(email),
    password: V.compose(
      V.required(),
      V.maxLength(maxLengthOfPassword),
      V.minLength(minLengthOfPassword),
      V.pattern(/^[\x21-\x7E]*$/, 'validCharacter'),
      V.pattern(/^.*[A-Z].*$/),
      V.pattern(/^.*[a-z].*$/),
      V.pattern(/^.*[0-9].*$/),
    )(password),
    passwordConfirmation: V.compose(
      V.required(),
      V.condition(() => password === passwordConfirmation, 'equalPassword'),
    )(passwordConfirmation),
    firstName: V.compose(
      V.required(),
    )(firstName),
    lastName: V.compose(
      V.required(),
    )(lastName),
    organization: V.compose(
      V.required(),
    )(organization),
    contactNumber: V.compose(
      V.required(),
    )(contactNumber),
    country: V.compose(
      V.required(),
    )(country),
    purpose: V.compose(
      V.required(),
    )(purpose),
    language: V.compose(
      V.required(),
    )(String(language)),
    eula: V.compose(
      V.required(),
    )(eula ? 'checked' : ''),
  };
};

const validationErrorToMessage: Readonly<Record<T.RequiredSignUpFormKeys, Readonly<{
  [key: string]: TextDictionary;
}>>> = {
  email: {
    required: Text.error.email.required,
    pattern: Text.error.email.pattern,
    existed: Text.error.email.existed,
  },
  password: {
    required: Text.error.password.required,
    minLength: Text.error.password.minLength,
    maxLength: Text.error.password.maxLength,
    pattern: Text.error.password.pattern,
    validCharacter: Text.error.password.validCharacter,
  },
  passwordConfirmation: {
    required: Text.error.passwordConfirmation.required,
    equalPassword: Text.error.passwordConfirmation.equalPassword,
  },
  firstName: {
    required: Text.error.firstName.required,
  },
  lastName: {
    required: Text.error.lastName.required,
  },
  organization: {
    required: Text.error.organization.required,
  },
  contactNumber: {
    required: Text.error.contactNumber.required,
  },
  country: {
    required: Text.error.country.required,
  },
  purpose: {
    required: Text.error.purpose.required,
  },
  language: {
    required: Text.error.language.required,
  },
  eula: {
    required: Text.error.eula.required,
  },
};

const loadingDivCustomStyle: CSSObject = {
  border: `3px solid ${dsPalette.grey40.toString()}`,
  borderTop: `3px solid ${palette.white.toString()}`,
};

export interface Props {
  readonly signUpStatus: T.APIStatus;
  readonly signUpError?: T.HTTPError;
  readonly primaryColor?: T.PlanConfig['primaryColor'];
  readonly companyName?: T.PlanConfig['companyName'];
  onSubmit(formValues: T.SignUpFormValues): void;
}

export interface State {
  readonly isSubmitValidatedOnce?: boolean;
  readonly errors?: Partial<Record<T.SignUpFormKeys, TextDictionary>>;
  readonly formValues: T.SignUpFormValues;
}

/**
 * @author Junyoung Clare Jang <clare.angelswing@gmail.com>
 * @desc form for sign up page
 */
class SignUpForm extends Component<Props & L10nProps, State> {
  private emailAvailabilitySub?: Subscription;

  public constructor(props: Props & L10nProps) {
    super(props);

    this.state = {
      formValues: {
        avatar: undefined,
        email: '',
        password: '',
        passwordConfirmation: '',
        firstName: '',
        lastName: '',
        organization: '',
        contactNumber: '',
        country: 'Korea, Republic of',
        purpose: '',
        language: T.Language.KO_KR,
        eula: false,
      },
    };
  }

  @autobind
  private isEmailAvailable(email: string): Observable<boolean> {
    if (this.emailAvailabilitySub !== undefined) {
      this.emailAvailabilitySub.unsubscribe();
    }

    const url: string = makeV2APIURL(`check_email_exists?email=${email}`);

    return ajax.get(url).pipe(
      map(({ response }) => response.status === 1),
      map((existed) => {
        this.setState({
          errors: {
            ...this.state.errors,
            email: existed ? validationErrorToMessage.email.existed : undefined,
          },
        });

        return !existed;
      }),
      catchError((err) => {
        this.setState({
          errors: {
            ...this.state.errors,
            email: Text.error.email.error,
          },
        });

        throw err;
      }),
    );
  }

  @autobind
  private validateFormValues(isSubmit?: boolean, kind?: keyof ValidationResults): boolean {
    // eslint-disable-next-line
    const validationResults: ValidationResults =
      validateForm(this.state.formValues);
    const invalidResult: V.ValidationResult | undefined =
      _.find(validationResults, (validationResult) => !validationResult.valid);

    // Update a specific error
    let kindError: Partial<Record<T.SignUpFormKeys, TextDictionary>> = {};
    if (kind) {
      const validationResult: V.ValidationResult = validationResults[kind];
      if (validationResult.errors.length > 0) {
        kindError = {
          [kind]: validationErrorToMessage[kind][validationResult.errors[0]],
        };
      }
    }

    if (
      validationResults.email.valid &&
      (isSubmit || this.state.isSubmitValidatedOnce || (kind && kind === 'email'))
    ) {
      // Checking Email availability
      this.emailAvailabilitySub =
        this.isEmailAvailable(this.state.formValues.email)
          .subscribe();
    }

    const errors: Partial<Record<T.SignUpFormKeys, TextDictionary>> = isSubmit ? _.mapValues(
      validationResults,
      (validationResult, key: T.RequiredSignUpFormKeys) => validationResult.errors.length > 0 ?
        validationErrorToMessage[key][validationResult.errors[0]] :
        undefined) : {
      ...this.state.errors,
      ...kindError,
    };

    if (invalidResult || Object.values(errors).filter((e) => e !== undefined).length > 0) {
      this.setState({
        isSubmitValidatedOnce: isSubmit || this.state.isSubmitValidatedOnce,
        errors,
      });

      return false;
    }

    return true;
  }

  @autobind
  private handleSubmit(): void {
    if (this.validateFormValues(true)) {
      this.emailAvailabilitySub =
        this.isEmailAvailable(this.state.formValues.email)
          .subscribe((available) => {
            if (available) {
              this.props.onSubmit(this.state.formValues);
            }
          });
    }
  }

  @autobind
  private handleChange<K extends T.SignUpFormKeys, D extends T.SignUpFormValues[K]>(kind: K, value: D): void {
    const { formValues }: State = this.state;
    if (kind in formValues) {
      if (formValues[kind] !== value) {
        this.setState(({ formValues: prevFormValues }) => ({
          formValues: {
            ...prevFormValues,
            [kind]: (kind === 'email' && typeof value === 'string') ? value.trim() : value,
          },
        }));
        if (kind !== 'avatar') {
          this.setState({
            errors: {
              ...this.state.errors,
              [kind]: undefined,
            },
          });
        }
      }
    }
  }

  @autobind
  private handleBlur(kind: keyof ValidationResults): void {
    this.validateFormValues(false, kind);
  }

  private getErrorMessage(fieldName: T.SignUpFormKeys): string | undefined {
    if (this.state.errors !== undefined && this.state.errors[fieldName] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.state.errors[fieldName]![this.props.language];
    } else {
      return undefined;
    }
  }

  public render(): ReactNode {
    const { language, signUpStatus, primaryColor }: Props & L10nProps = this.props;
    const { formValues }: State = this.state;

    const signupButtonContent: ReactNode = signUpStatus !== T.APIStatus.PROGRESS
      ? l10n(Text.submit, language)
      : <LoadingIcon loadingDivCustomStyle={loadingDivCustomStyle} />;

    const handleEulaLinkClick: (event: SyntheticEvent) => void = (event) => event.stopPropagation();

    const inputFieldNames: Array<UserInfoInputFieldKind> = [
      'email',
      'password',
      'passwordConfirmation',
      'firstName',
      'lastName',
      'contactNumber',
      'organization',
    ];
    const inputFields: ReactNode = inputFieldNames
      .map((fieldName) => (
        <UserInfoInputField
          rootStyle={UserInfoFieldRootStyle}
          labelStyle={UserInfoFieldLabelStyle}
          key={fieldName}
          kind={fieldName}
          value={formValues[fieldName]}
          companyName={this.props.companyName}
          error={this.getErrorMessage(fieldName)}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
        />
      ));

    const dropdownFieldNames: Array<UserInfoDropdownFieldsKind> = [
      'country',
      'purpose',
      'language',
    ];
    const dropdownFields: ReactNode = dropdownFieldNames
      .map((fieldName) => (
        <UserInfoDropdownFields
          labelStyle={UserInfoFieldLabelStyle}
          key={fieldName}
          kind={fieldName}
          value={formValues[fieldName]}
          error={this.getErrorMessage(fieldName)}
          onChange={this.handleChange}
        />
      ));

    //@fixme: when jsx allow direct js comment
    const checkBoxLabel: ReactNode = (
      <>
        {l10n(Text.checkBoxLabelParts[0], language)}
        <HyperLink
          href={route.externalLink.terms}
          target={'_blank'}
          onClick={handleEulaLinkClick}
        >
          {l10n(Text.checkBoxLabelParts[1], language)}
        </HyperLink>
        {l10n(Text.checkBoxLabelParts[2], language)}
        <HyperLink
          href={route.externalLink.privatePolicy}
          target={'_blank'}
          onClick={handleEulaLinkClick}
        >
          {/* eslint-disable-next-line no-magic-numbers */}
          {l10n(Text.checkBoxLabelParts[3], language)}
        </HyperLink>
        {/* eslint-disable-next-line no-magic-numbers */}
        {l10n(Text.checkBoxLabelParts[4], language)}
      </>
    );

    const eulaErrorMessage: ReactNode =
      this.state.isSubmitValidatedOnce && !formValues.eula ? (
        <ErrorMessage>{`* ${l10n(Text.error.eula.required, language)}`}</ErrorMessage>
      ) : undefined;

    const serverErrorMessage: ReactNode =
      this.state.isSubmitValidatedOnce && this.state.errors !== undefined
      && this.state.errors.email === Text.error.email.error ? (
          <ErrorMessage>{`* ${l10n(Text.error.email.error, language)}`}</ErrorMessage>
        ) : undefined;

    const eulaCheckbox: ReactNode = this.props.primaryColor
      ? (
        <CustomColorCheckbox
          color={this.props.primaryColor}
          checked={formValues.eula}
          onChange={_.partial(this.handleChange, 'eula')}
        >
          {checkBoxLabel}
        </CustomColorCheckbox>
      )
      : (
        <DDMCheckBox
          label={checkBoxLabel}
          checked={formValues.eula}
          onChange={_.partial(this.handleChange, 'eula')}
          labelStyle={DDMCheckBoxProp}
          isVerticalAlign={true}
        />
      );

    return (
      <Root>
        <ProfileImageUploader
          avatar={formValues.avatar}
          onUpload={_.partial(this.handleChange, 'avatar')}
        />
        <HiddenInput type='email' />
        <HiddenInput type='password' />
        {inputFields}
        {dropdownFields}
        <DDMhr />
        {eulaCheckbox}
        {eulaErrorMessage}
        {serverErrorMessage}
        <NonAuthConfirmButton
          customColor={primaryColor}
          disabled={signUpStatus === T.APIStatus.PROGRESS}
          onClick={this.handleSubmit}
          data-testid='signup-button'
        >
          {signupButtonContent}
        </NonAuthConfirmButton>
      </Root>
    );
  }
}
export default withL10n(SignUpForm);
