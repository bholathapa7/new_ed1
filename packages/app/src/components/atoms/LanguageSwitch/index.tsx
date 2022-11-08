import React, { FC, ReactNode } from 'react';
import styled, { CSSObject } from 'styled-components';

import * as T from '^/types';

import palette from '^/constants/palette';

import changeI18n, { ChangeI18nProps } from '^/components/atoms/ChangeI18n';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';

import Text from './text';

interface CustomStyleProps {
  readonly customStyle?: CSSObject;
}

const Root =
  styled.ul<CustomStyleProps>({
    display: 'flex',
    direction: 'ltr',
    listStyle: 'none',
  }, ({ customStyle }) => customStyle ? customStyle : {});

const Item =
  styled.li({
    fontSize: '13px',
    lineHeight: 1,
    color: palette.textLight.toString(),
    fontWeight: 'normal',

    cursor: 'pointer',

    ':hover, &.selected': {
      // eslint-disable-next-line no-magic-numbers
      fontWeight: 500,
      color: palette.textGray.toString(),
    },
  });

const Divider =
  styled.div({
    width: '1px',

    margin: '0px 10px',

    backgroundColor: palette.textLight.toString(),
  });

export interface Props {
  readonly className?: string;
  readonly labelMapper?: Record<T.Language, string>;
  readonly customStyle?: CSSObject;
  readonly target: Array<T.Language>;
}

/**
 * Component for content list in sidebar of contents page
 */

const LanguageSwitch: FC<Props & L10nProps & ChangeI18nProps> = ({
  language, className, customStyle, labelMapper, target, changeLanguage,
}) => {
  const langToItem: (lang: T.Language, index: number) => ReactNode = (lang, index) => {
    const handleClick: () => void = () => changeLanguage(lang);
    const mapper: Record<T.Language, string> = labelMapper ?? Text.language;
    return [
      index !== 0 ? <Divider key={`divider-${index - 1}`} /> : undefined,
      (
        <Item
          className={language === lang ? 'selected' : ''}
          onClick={handleClick}
          key={lang}
        >
          {mapper[lang]}
        </Item>
      ),
    ];
  };

  return (
    <Root className={className} data-testid='language-switch' customStyle={customStyle}>
      {target.map(langToItem)}
    </Root>
  );
};

export default withL10n(changeI18n(LanguageSwitch));
