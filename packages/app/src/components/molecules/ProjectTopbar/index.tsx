import React, { FC } from 'react';
import { ajax } from 'rxjs/ajax';
import { map, tap } from 'rxjs/operators';
import { useSelector } from 'react-redux';

import { AuthHeader, makeV2APIURL } from '^/store/duck/API';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import { MenuItem } from '^/components/molecules/MenuList';
import Topbar from '^/components/molecules/Topbar';
import route from '^/constants/routes';

import { l10n } from '^/utilities/l10n';

import Text from './text';

import * as T from '^/types';
import { ESSPlanConfig } from '^/store/duck/PlanConfig';

export interface Props {
  authHeader?: AuthHeader;
  openListTab(): void;
  openMypage(): void;
  signout(): void;
}

/**
 * Project page top bar component
 */
const ProjectTopbar: FC<Props & L10nProps> = ({
  openListTab, openMypage, signout, authHeader, language,
}) => {
  const isESS: boolean = useSelector((state: T.State) => state.PlanConfig.config?.slug === ESSPlanConfig.slug);

  const gotoFAQ: () => void = () => {
    if (isESS) {
      window.open(l10n(route.externalLink.essSupport, language),'_blank');
      return;
    }

    if (authHeader === undefined) {
      return;
    }

    const url: string = makeV2APIURL('faq');
    ajax.get(url, authHeader).pipe(
      map(({ response }) => response),
      tap(({ redirect_url }) => window.open(redirect_url, '_blank')),
    ).subscribe();
  };

  return (
    <Topbar withLanguageSwitch={false} onLogoClick={openListTab}>
      <MenuItem selected={false} onClick={openMypage}>
        {l10n(Text.myPage, language)}
      </MenuItem>
      <MenuItem selected={false} onClick={gotoFAQ}>
        {l10n(Text.questions, language)}
      </MenuItem>
      <MenuItem selected={false} onClick={signout}>
        {l10n(Text.logout, language)}
      </MenuItem>
    </Topbar>
  );
};
export default withL10n(ProjectTopbar);
