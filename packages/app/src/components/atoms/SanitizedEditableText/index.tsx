import React, { FC, FocusEventHandler } from 'react';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import sanitize from 'sanitize-html';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';
import { FontFamily } from '^/constants/styles';

const Root = styled.div({
  position: 'absolute',
  top: 0,
  backgroundColor: palette.white.toString(),
  borderRadius: '2px',
  backdropFilter: 'blur(3px)',
  boxShadow: '0 2px 3px 0 rgba(0, 0, 0, 0.48)',

  '> div': {
    display: 'inline-block',
    fontFamily: FontFamily.ROBOTO,
    fontWeight: 'bold',
    whiteSpace: 'pre',
    verticalAlign: 'bottom',
    padding: '6px',
    lineHeight: 1.2,
  },
});

interface Props {
  readonly htmlId: string;
  readonly text: string | undefined;
  readonly customStyle?: CSSObject;
  readonly allowedTags?: sanitize.IOptions['allowedTags'];
  readonly allowedAttributes?: sanitize.IOptions['allowedAttributes'];
  onBlur?(text: string): void;
}

export const SanitizedEditableText: FC<Props> = ({ htmlId, text, customStyle, allowedTags, allowedAttributes, onBlur }) => {
  const onChangeContentEditable: (v: ContentEditableEvent) => void = () => undefined;
  const onBlurContentEditable: FocusEventHandler<HTMLDivElement> = (v) => {
    const sanitizedText: string = sanitize(v.currentTarget.innerHTML, {
      allowedTags: allowedTags ?? [],
      allowedAttributes: allowedAttributes ?? {},
    });

    // Trimming the sanitized text because there might be extra space
    // created from the contentEditable for unknown reason.
    onBlur?.(sanitizedText.trim());
  };

  return (
    <Root
      id={htmlId}
      style={customStyle}
    >
      <ContentEditable
        html={text ?? ''}
        onChange={onChangeContentEditable}
        onBlur={onBlurContentEditable}
      />
    </Root>
  );
};
