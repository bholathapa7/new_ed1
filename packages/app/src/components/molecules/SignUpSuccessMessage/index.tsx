import React, { FC } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

import palette from '^/constants/palette';
import route from '^/constants/routes';

import { l10n } from '^/utilities/l10n';

import { ConfirmButton } from '^/components/atoms/Buttons';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import Text from './text';

import * as T from '^/types';
import { ESSPlanConfig } from '^/store/duck/PlanConfig';

const Root = styled.div({
  boxSizing: 'border-box',
  width: '460px',

  padding: '50px',
  paddingBottom: '30px',
  backgroundColor: palette.white.toString(),
});

const Description = styled.p({
  marginBottom: '30px',

  lineHeight: 1.6,
  fontSize: '15px',
  color: palette.textGray.toString(),
});

const LoginButton = styled(ConfirmButton)({
  width: '160px',
  height: '58px',
  fontSize: '16px',
  display: 'block',
  margin: 'auto',
  marginTop: '30px',
});

const TutorialLink = styled.a({
  display: 'block',
  marginTop: '20px',

  width: '100%',

  fontSize: '14px',
  textAlign: 'center',
  fontWeight: 'bold',
  color: palette.textBlack.toString(),
});

export interface Props {
  onLogin(): void;
}

const SignUpSuccessMessage: FC<Props & L10nProps> = (
  { onLogin, language },
) => {
  const isESS: boolean = useSelector((state: T.State) => state.PlanConfig.config?.slug === ESSPlanConfig.slug);

  return (
    <Root>
      <Description>
        {l10n(Text.description, language)}
      </Description>
      <LoginButton onClick={onLogin}>
        {l10n(Text.login, language)}
      </LoginButton>
      <TutorialLink
        href={l10n(isESS ? route.externalLink.essSupport : route.externalLink.support, language)}
        target='_blank'
        rel='noopener noreferrer'
      >
        {l10n(Text.tutorial.text, language)}
      </TutorialLink>
    </Root>
  );
};

export default withL10n(SignUpSuccessMessage);
