import React, { FC } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

import * as T from '^/types';
import { l10n } from '^/utilities/l10n';

import { NonAuthConfirmButton } from '^/components/atoms/Buttons';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import Text from './text';


const Root =
  styled.div({
    boxSizing: 'border-box',
    backgroundColor: palette.white.toString(),
  });

const Description =
  styled.p({
    marginBottom: '30px',

    fontSize: '15px',
    lineHeight: 1.6,
    color: palette.textGray.toString(),
  });


export interface Props {
  readonly primaryColor?: T.PlanConfig['primaryColor'];
  backToForm(): void;
}

/**
 * @author Junyoung Clare Jang
 * @desc Fri Feb  9 15:34:51 2018 UTC
 */
const PasswordResetFailureMessage: FC<Props & L10nProps> = (
  { primaryColor, backToForm, language },
) => (
  <Root>
    <Description>
      {l10n(Text.description, language)}
    </Description>
    <NonAuthConfirmButton
      customColor={primaryColor}
      onClick={backToForm}
      data-testid='retry-button'
    >
      {l10n(Text.retry, language)}
    </NonAuthConfirmButton>
  </Root>
);
export default withL10n(PasswordResetFailureMessage);
