import React, { FC } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

import palette from '^/constants/palette';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import { MenuItem } from '^/components/molecules/MenuList';
import Topbar from '^/components/molecules/Topbar';

import route from '^/constants/routes';
import { l10n } from '^/utilities/l10n';

import Text from './text';
import * as T from '^/types';

import { ESSPlanConfig } from '^/store/duck/PlanConfig';

export interface Props {
  isLoginPage: boolean;
  isSignUpPage: boolean;
  isPasswordPage: boolean;
  toHomePage(): void;
  toLoginPage(): void;
  toSignUpPage(): void;
}

const LinkItem = styled.a({
  color: 'inherit',
  textDecoration: 'none',
});

const FrontTopbar: FC<Props & L10nProps> = (
  { isLoginPage, isSignUpPage, toHomePage, toLoginPage, toSignUpPage, isPasswordPage, language },
) => {
  const isLanguageSwitchNeeded: boolean = isLoginPage || isSignUpPage || isPasswordPage;

  const isESS: boolean = useSelector((state: T.State) => state.PlanConfig.config?.slug === ESSPlanConfig.slug);

  return (
    <Topbar
      onLogoClick={toHomePage}
      withLanguageSwitch={isLanguageSwitchNeeded}
      backgroundColor={palette.background.toString()}
    >
      <MenuItem selected={false}>
        <LinkItem
          href={l10n(isESS ? route.externalLink.essSupport : route.externalLink.support, language)}
          target='_blank'
          rel='noopener noreferrer'
        >
          {l10n(Text.support, language)}
        </LinkItem>
      </MenuItem>
      <MenuItem selected={isLoginPage} onClick={toLoginPage}>
        {l10n(Text.signIn, language)}
      </MenuItem>
      <MenuItem selected={isSignUpPage} onClick={toSignUpPage}>
        {l10n(Text.signUp, language)}
      </MenuItem>
    </Topbar>
  );
};
export default withL10n(FrontTopbar);
