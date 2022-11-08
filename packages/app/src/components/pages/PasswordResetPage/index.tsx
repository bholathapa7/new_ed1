import React, { FC, ReactNode, useEffect } from 'react';
import { CSSObject } from 'styled-components';

import * as T from '^/types';

import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { l10n } from '^/utilities/l10n';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import LoadingScreen from '^/components/molecules/LoadingScreen';
import PasswordResetSuccessMessage from '^/components/molecules/PasswordResetSuccessMessage';
import TitleTemplatePage from '^/components/pages/TitleTemplatePage';
import palette from '^/constants/palette';
import PasswordResetForm from '^/containers/organisms/PasswordResetForm';

import Text from './text';

const descriptionStyle: CSSObject = {
  textAlign: 'left',
  lineHeight: 1,
};

export interface Props {
  readonly patchPasswordStatus: T.APIStatus;
  readonly patchPasswordError?: T.HTTPError;
  readonly isPlanConfigLoaded?: boolean;
  resetPassword(): void;
  resetPatchPasswordStatus(): void;
}

/**
 * @author Junyoung Clare Jang <clare.angelswing@gmail.com>
 * @desc page for re-setting password
 */
const PasswordResetPage: FC<Props & L10nProps> = ({
  patchPasswordStatus: status,
  language,
  isPlanConfigLoaded,
  resetPassword,
  resetPatchPasswordStatus,
}) => {
  useEffect(() => () => {
    resetPassword();
    resetPatchPasswordStatus();
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
      contents = <PasswordResetForm />;
      break;
    case T.APIStatus.ERROR:
      title = l10n(Text.error, language);
      break;
    case T.APIStatus.SUCCESS:
      title = l10n(Text.success, language);
      contents = <PasswordResetSuccessMessage />;
      break;
    /* istanbul ignore next: this case should not be accessible */
    default:
      title = '';
      exhaustiveCheck(status);
  }

  return (
    <TitleTemplatePage
      title={title}
      descriptionStyle={descriptionStyle}
    >
      {contents}
    </TitleTemplatePage>
  );
};
export default withL10n(PasswordResetPage);
