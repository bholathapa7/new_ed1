import React, { FC, ReactNode, useMemo } from 'react';
import { useSelector } from 'react-redux';
import styled, { CSSObject } from 'styled-components';

import LanguageSwitch from '^/components/atoms/LanguageSwitch';
import LoadingScreen from '^/components/molecules/LoadingScreen';
import TitleTemplatePage from '^/components/pages/TitleTemplatePage';
import palette from '^/constants/palette';
import route from '^/constants/routes';
import SignInForm from '^/components/organisms/SignInForm';
import CustomSignInForm from '^/components/organisms/SignInForm/Custom';
import { MediaQuery } from '^/constants/styles';
import * as T from '^/types';
import { l10n } from '^/utilities/l10n';

import Text from './text';
import { useL10n, UseL10n } from '^/hooks';
import dsPalette from '^/constants/ds-palette';
import { ESSPlanConfig } from '^/store/duck/PlanConfig';


const FooterContainer = styled.div({
  width: '100%',
  position: 'absolute',
  bottom: '-28px',
  left: '0',
  display: 'flex',
  justifyContent: 'space-between',

  [MediaQuery[T.Device.MOBILE_L]]: {
    width: '94%',
    padding: '0 3%',
    justifyContent: 'space-around',
  },
});

const LoginDividerMobile = styled.hr({
  display: 'none',
  width: '75%',
  position: 'absolute',
  bottom: 0,
  borderColor: dsPalette.grey20.toString(),

  [MediaQuery[T.Device.MOBILE_L]]: {
    display: 'block',
  },
});

const LinkContainer = styled.ul({
  display: 'flex',
  direction: 'ltr',
  listStyle: 'none',
  li: {
    display: 'flex',
    marginLeft: '12px',
  },
});

const LinkItem = styled.a({
  fontSize: '12px',
  fontWeight: 500,
  color: dsPalette.typeTertiary.toString(),
  textDecoration: 'none',
  lineHeight: 1,
});

const descriptionStyle: CSSObject = {
  padding: '50px',
  boxShadow: 'rgb(20 20 20 / 4%) 0px 12px 24px 0px, rgb(20 20 20 / 2%) 0px 1px 3px 0px',
  borderRadius: '6px',
  lineHeight: 1,
};

const languageTarget: [T.Language, T.Language] = [T.Language.KO_KR, T.Language.EN_US];

const LoginPage: FC = () => {
  const [, language]: UseL10n = useL10n();

  const isPlanConfigLoaded: boolean = useSelector((state: T.State) => !!state.PlanConfig.config);
  const needsCustomization: boolean = useSelector((state: T.State) => !!state.PlanConfig.config?.slug);

  const bgUrl: string | undefined = useSelector((state: T.State) => state.PlanConfig.config?.bgUrl);

  const customStyle: CSSObject = {
    li: {
      fontSize: '12px',
      color: dsPalette.grey60.toString(),
      ':hover, &.selected': {
        color: bgUrl ? palette.white.toString() : dsPalette.typePrimary.toString(),
      },

      [MediaQuery[T.Device.MOBILE_L]]: {
        ':hover, &.selected': {
          color: dsPalette.typePrimary.toString(),
        },
      },
    },
    div: {
      margin: '0px 5px',
    },
  };

  const isESS: boolean = useSelector((state: T.State) => state.PlanConfig.config?.slug === ESSPlanConfig.slug);

  const pageChildren: ReactNode = useMemo(() => {
    if (needsCustomization) {
      return (
        <>
          <CustomSignInForm />
          <LoginDividerMobile />
          <FooterContainer>
            <LanguageSwitch
              target={languageTarget}
              labelMapper={Text.language}
              customStyle={customStyle}
            />
            <LinkContainer>
              <li>
                <LinkItem
                  href={l10n(isESS ? route.externalLink.essSupport : route.externalLink.support, language)}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {l10n(Text.support, language)}
                </LinkItem>
              </li>
              <li>
                <LinkItem href={route.externalLink.privatePolicy}>{l10n(Text.privacyPolicy, language)}</LinkItem>
              </li>
              <li>
                <LinkItem href={route.externalLink.terms}>{l10n(Text.termsAndConditions, language)}</LinkItem>
              </li>
            </LinkContainer>
          </FooterContainer>
        </>
      );
    }

    return (
      <SignInForm />
    );
  }, [needsCustomization, language]);

  const title: string | undefined = useMemo(() => needsCustomization ? undefined : l10n(Text.title, language), [needsCustomization, language]);

  const customDescriptionStyle: CSSObject | undefined = useMemo(() => needsCustomization ? undefined : descriptionStyle, [needsCustomization]);

  if (!isPlanConfigLoaded) {
    return <LoadingScreen backgroundColor={palette.white} textColor={palette.textGray} />;
  }

  return (
    <TitleTemplatePage
      title={title}
      descriptionStyle={customDescriptionStyle}
    >
      {pageChildren}
    </TitleTemplatePage>
  );
};

export default LoginPage;
