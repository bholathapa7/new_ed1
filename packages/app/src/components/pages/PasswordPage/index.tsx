import React, { FC, ReactNode, useEffect } from 'react';
import { CSSObject } from 'styled-components';

import palette from '^/constants/palette';

import * as T from '^/types';

import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { l10n } from '^/utilities/l10n';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import LoadingScreen from '^/components/molecules/LoadingScreen';
import TitleTemplatePage from '^/components/pages/TitleTemplatePage';
import EmailSuccessMessage from '^/containers/molecules/EmailSuccessMessage';
import PasswordResetFailureMessage from '^/containers/molecules/PasswordResetFailureMessage';
import PasswordForm from '^/containers/organisms/PasswordForm';

import Text from './text';

const simpleDescriptionStyle: CSSObject = {
  minWidth: '460px',
  p: {
    textAlign: 'left',
  },
};

const customDescriptionStyle: CSSObject = {
  p: {
    textAlign: 'left',
    fontSize: '12px',
  },
};

// eslint-disable-next-line
export interface Props {
  readonly passwordResetStatus: T.APIStatus;
  readonly passwordResetError?: T.HTTPError;
  readonly isPlanConfigLoaded?: boolean;
  readonly needsCustomization?: boolean;
  resetEmail(): void;
  resetPasswordResetStatus(): void;
}

/**
 * @author Junyoung Clare Jang <clare.angelswing@gmail.com>
 * @desc finding password page
 */
const PasswordPage: FC<Props & L10nProps> = ({
  passwordResetStatus: status, isPlanConfigLoaded, language, needsCustomization, resetEmail, resetPasswordResetStatus,
}) => {
  useEffect(() => () => {
    resetEmail();
    resetPasswordResetStatus();
  }, []);

  if (!isPlanConfigLoaded) {
    return <LoadingScreen backgroundColor={palette.white} textColor={palette.textGray} />;
  }

  let title: string;
  let contents: ReactNode;

  /**
   * @todo Add view for failure
   */
  switch (status) {
    case T.APIStatus.IDLE:
    case T.APIStatus.PROGRESS:
      title = l10n(Text.reset, language);
      contents = <PasswordForm />;
      break;
    case T.APIStatus.ERROR:
      title = l10n(Text.error, language);
      contents = <PasswordResetFailureMessage />;
      break;
    case T.APIStatus.SUCCESS:
      title = l10n(Text.success, language);
      contents = <EmailSuccessMessage />;
      break;
    /* istanbul ignore next: this case should not be accessible*/
    default:
      title = '';
      contents = <div />;
      exhaustiveCheck(status);
  }

  return (
    <TitleTemplatePage
      title={title}
      descriptionStyle={needsCustomization ? customDescriptionStyle : simpleDescriptionStyle}
    >
      {contents}
    </TitleTemplatePage>
  );
};
export default withL10n(PasswordPage);
