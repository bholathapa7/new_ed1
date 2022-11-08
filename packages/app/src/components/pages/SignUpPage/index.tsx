import React, { FC, ReactNode, useEffect } from 'react';

import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { l10n } from '^/utilities/l10n';

import * as T from '^/types';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import LoadingScreen from '^/components/molecules/LoadingScreen';
import TitleTemplatePage from '^/components/pages/TitleTemplatePage';
import palette from '^/constants/palette';
import SignUpFailureMessage from '^/containers/molecules/SignUpFailureMessage';
import SignUpSuccessMessage from '^/containers/molecules/SignUpSuccessMessage';
import SignUpForm from '^/containers/organisms/SignUpForm';

import Text from './text';

export interface Props {
  readonly signUpStatus: T.APIStatus;
  readonly signUpError?: T.HTTPError;
  readonly isPlanConfigLoaded?: boolean;
  resetSignUpAPI(): void;
}

/**
 * @author Junyoung Clare Jang <clare.angelswing@gmail.com>
 * @desc page for sign up
 */

const SignUpPage: FC<Props & L10nProps> = ({
  signUpStatus: status, isPlanConfigLoaded, language, resetSignUpAPI,
}) => {
  let title: string;
  let contents: ReactNode;

  if (!isPlanConfigLoaded) {
    return <LoadingScreen backgroundColor={palette.white} textColor={palette.textGray} />;
  }

  useEffect(() => () => resetSignUpAPI(), []);

  switch (status) {
    case T.APIStatus.IDLE:
    case T.APIStatus.PROGRESS:
      title = l10n(Text.formTitle, language);
      contents = <SignUpForm />;
      break;
    case T.APIStatus.ERROR:
      title = l10n(Text.errorTitle, language);
      contents = <SignUpFailureMessage />;
      break;
    case T.APIStatus.SUCCESS:
      title = l10n(Text.successTitle, language);
      contents = <SignUpSuccessMessage />;
      break;
    /* istanbul ignore next: this case should not be accessible*/
    default:
      title = '';
      contents = <div />;
      exhaustiveCheck(status);
  }

  return (
    <TitleTemplatePage title={title} isScrollable={true}>
      {contents}
    </TitleTemplatePage>
  );
};
export default withL10n(SignUpPage);
