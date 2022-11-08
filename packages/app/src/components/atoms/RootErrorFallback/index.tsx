import React, { FC } from 'react';
import styled from 'styled-components';

import ErrorDisplay from '^/components/atoms/ErrorDisplay';
import * as T from '^/types';
import { l10n } from '^/utilities/l10n';
import BreakLineText from '../BreakLineText';
import Text from './text';


const HelpEmail =
  styled.a({
    color: 'var(--color-theme-primary-lightest)',
    display: 'block',
  });

const language: T.Language = navigator.language.includes('ko') ? T.Language.KO_KR : T.Language.EN_US;

export const RootErrorFallback: FC = () => (
  <ErrorDisplay>
    <BreakLineText>{l10n(Text.message, language)}</BreakLineText>
    <HelpEmail>help@angelswing.io</HelpEmail>
  </ErrorDisplay>
);
