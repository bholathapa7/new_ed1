import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';

import palette from '^/constants/palette';

import FrontFooter from '^/components/molecules/FrontFooter';
import FrontTopbar from '^/containers/molecules/FrontTopbar';
import * as T from '^/types';

const Root = styled.div({
  display: 'flex',

  backgroundColor: palette.white.toString(),

  flexDirection: 'column',
  alignItems: 'center',
  overflow: 'hidden',
});

/**
 * @todo change css when user change the language.
 */
const PageTitle = styled.h1({
  marginTop: '70px',
  marginBottom: '70px',

  display: 'block',

  height: '50px',

  fontSize: '55px',
  fontWeight: 500,

  color: palette.darkBlack.toString(),
});

const ContentsWrapper = styled.section({
  marginBottom: '100px',
});
ContentsWrapper.displayName = 'ContentsWrapper';

const ParagraphTitle= styled.h3({
  display: 'block',

  paddingTop: '40px',
  boxSizing: 'border-box',

  marginBottom: '40px',

  height: '17px',

  fontSize: '16px',
  fontWeight: 500,
  lineHeight: 1.06,
  letterSpacing: '-0.4px',
  textAlign: 'left',

  color: palette.darkBlack.toString(),
});

const ParagraphContentBox = styled.div({
  paddingBottom: '40px',

  marginRight: '60px',

  color: palette.textGray.toString(),
});

const ParagraphContent = styled.p({
  display: 'block',

  fontSize: '13px',
  fontWeight: 300,
  textAlign: 'left',
  lineHeight: 1.92,
  color: palette.textGray.toString(),
});

const ParagraphBox = styled.div({
  marginBottom: '20px',

  width: '1140px',

  paddingLeft: '60px',

  backgroundColor: palette.background.toString(),
});

export interface ParagraphProps {
  title: string;
  content: string;
}

export interface TextContentBlock {
  title: Readonly<Partial<Record<T.Language, string>>>;
  content: Readonly<Partial<Record<T.Language, string>>>;
}

const Paragraph: FC<ParagraphProps> = ({ title, content }) => {
  const splitedContent: Array<string> = content.split(/\n/);

  return (
    <ParagraphBox>
      <ParagraphTitle>{title}</ParagraphTitle>
      <ParagraphContentBox>
        {splitedContent.map((part, key) => (<ParagraphContent key={key}>{part}</ParagraphContent>))}
      </ParagraphContentBox>
    </ParagraphBox>
  );
};

// eslint-disable-next-line
export interface Props {
  readonly title: string;
  readonly paragraphs: Array<ParagraphProps>;
}

/**
 * @author Jaewon Seo <jaewon.angelswing@gmail.com>
 * @desc create simple document page
 */
const SimpleDocumentPage: FC<Props> = ({ title, paragraphs }) => {
  const contents: Array<ReactNode> = paragraphs.map(
    (information, index) => <Paragraph {...information} key={index} />,
  );

  return (
    <Root>
      <FrontTopbar />
      <PageTitle>{title}</PageTitle>
      <ContentsWrapper>
        {contents}
      </ContentsWrapper>
      <FrontFooter />
    </Root>
  );
};

export default SimpleDocumentPage;
