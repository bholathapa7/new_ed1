import React, { FC } from 'react';
import { useSelector } from 'react-redux';

import BreakLineText from '^/components/atoms/BreakLineText';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import LoadingScreen from '^/components/molecules/LoadingScreen';
import TitleTemplatePage from '^/components/pages/TitleTemplatePage';

import Text from './text';

import palette from '^/constants/palette';
import * as T from '^/types';
import { l10n } from '^/utilities/l10n';

const SignupRequestPage: FC<L10nProps> = ({ language }) => {
  const isPlanConfigLoaded: boolean = useSelector((state: T.State) => !!state.PlanConfig.config);

  if (!isPlanConfigLoaded) {
    return <LoadingScreen backgroundColor={palette.white} textColor={palette.textGray} />;
  }

  return (
    <TitleTemplatePage title={l10n(Text.title, language)}>
      <BreakLineText>
        {l10n(Text.description, language)}
      </BreakLineText>
    </TitleTemplatePage>
  );
};

export default withL10n(SignupRequestPage);
