import React, { FC, ReactNode } from 'react';
import Scrollbars, { ScrollbarProps } from 'react-custom-scrollbars';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';

import FrontTopbar from '^/containers/molecules/FrontTopbar';

import { Props } from '.';

const Root = styled.div({
  display: 'flex',

  boxSizing: 'border-box',
  width: '100%',
  height: '100%',

  flexDirection: 'column',
  backgroundColor: palette.background.toString(),
  overflow: 'hidden',
});

const ScrollbarsWrapper = styled(Scrollbars)<ScrollbarProps>({
  flexGrow: 1,
});

/**
 * @todo change css when user change the language.
 */
const PageTitle = styled.h1.attrs({
  className: 'no-select',
})({
  marginTop: '70px',
  marginBottom: '30px',

  textAlign: 'center',
  fontSize: '55px',
  fontWeight: 300,
  color: palette.textBlack.toString(),
});

const ContentsWrapper = styled.section({
  display: 'flex',
  marginBottom: '30px',

  justifyContent: 'center',
});
ContentsWrapper.displayName = 'ContentsWrapper';

interface CustomStyleProps {
  readonly customStyle?: CSSObject;
}
const Description = styled.div<CustomStyleProps>({
  maxWidth: '460px',
  boxSizing: 'border-box',

  padding: '50px',
  backgroundColor: palette.white.toString(),

  wordBreak: 'keep-all',
  fontSize: '15px',
  lineHeight: '25px',
  fontWeight: 'normal',
  color: palette.textGray.toString(),
  textAlign: 'center',
}, ({ customStyle }) => customStyle ? customStyle : {});
Description.displayName = 'Description';

const SimpleTitleTemplatePage: FC<Props> = ({ title, descriptionStyle, children }) => {
  const content: ReactNode = children ? (
    <ContentsWrapper>
      <Description
        customStyle={descriptionStyle}
        data-testid='simple-title-template-description'
      >
        {children}
      </Description>
    </ContentsWrapper>
  ) : undefined;

  return (
    <Root>
      <FrontTopbar />
      <ScrollbarsWrapper>
        <PageTitle>{title}</PageTitle>
        {content}
      </ScrollbarsWrapper>
    </Root>
  );
};

export default SimpleTitleTemplatePage;
