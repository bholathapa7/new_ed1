import _ from 'lodash-es';
import React, { ReactElement, ReactNode, memo, useCallback, useState } from 'react';
import styled, { CSSObject } from 'styled-components';

import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { UseState } from '^/hooks';
import BreakLineText from '../BreakLineText';


interface SelectProps {
  isSelected: boolean;
}

const Root = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const Card = styled.div<SelectProps>(({ isSelected }) => ({
  boxSizing: 'border-box',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  padding: '19px 12px 0',

  backgroundColor: palette.white.toString(),
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: isSelected ? 'var(--color-theme-primary)' : palette.disabledFont.toString(),
  borderRadius: '10px',

  color: dsPalette.title.toString(),

  cursor: 'pointer',
}));

const ImageWrapper = styled.div({
  marginBottom: '10px',
});

const Title = styled.span({
  textAlign: 'center',
  lineHeight: '18px',
  fontWeight: 'bold',

  marginBottom: '15px',
});

const Description = styled.span({
  lineHeight: '19px',

  wordBreak: 'keep-all',
});

const CheckboxWrapper = styled.div({
  position: 'relative',
});

const Input = styled.input({
  visibility: 'hidden',
});

const Checkbox = styled.label<SelectProps>(({ isSelected }) => ({
  position: 'absolute',
  left: 0,
  top: 0,

  content: '\' \'',

  width: '100%',
  height: '100%',

  cursor: 'pointer',

  ':before': {
    boxSizing: 'border-box',
    position: 'absolute',
    content: '\' \'',

    width: '100%',
    height: '100%',

    borderRadius: '50%',
    borderStyle: 'solid',
    borderWidth: '2px',
    borderColor: isSelected ? 'var(--color-theme-primary)' : palette.disabledFont.toString(),

    backgroundColor: palette.white.toString(),
  },
  ':after': isSelected ? {
    position: 'absolute',
    transform: 'translate(50%, 50%)',

    content: '\' \'',

    width: '50%',
    height: '50%',

    backgroundColor: 'var(--color-theme-primary)',
    borderRadius: '50%',
  } : undefined,
}));


interface CustomStyle {
  card: {
    default?: Pick<CSSObject, 'width' | 'height' | 'marginBottom'>;
    title?: Pick<CSSObject, 'height' | 'fontSize' | 'color'>;
    image?: Pick<CSSObject, 'width' | 'height'>;
    description?: Pick<CSSObject, 'fontSize' | 'color'>;
  };
  checkbox: Pick<CSSObject, 'width' | 'height'>;
}

export interface Props {
  readonly isSelected: boolean;
  readonly image?: ReactNode;
  readonly title: string | string[];
  readonly description: string;
  readonly customStyle?: CustomStyle;
  onSelect(isSelected: boolean): void;
}

function CardOption({
  isSelected, image, title, description, customStyle,
  onSelect,
}: Props): ReactElement {
  const [id]: UseState<string> = useState(() => _.uniqueId('CardOption-')); // lazy intial state

  const handleSelect: () => void = useCallback(() => {
    onSelect(!isSelected);
  }, [isSelected, onSelect]);

  return (
    <Root>
      <Card style={customStyle?.card.default} isSelected={isSelected} onClick={handleSelect}>
        <ImageWrapper style={customStyle?.card.image}>{image}</ImageWrapper>
        <Title style={customStyle?.card.title}>
          {Array.isArray(title) ? <BreakLineText>{title}</BreakLineText> : title}
        </Title>
        <Description style={customStyle?.card.description}>{description}</Description>
      </Card>
      <CheckboxWrapper style={customStyle?.checkbox}>
        <Input type='checkbox' id={`CardOption-${id}`} onClick={handleSelect} />
        <Checkbox htmlFor={`CardOption-${id}`} isSelected={isSelected} />
      </CheckboxWrapper>
    </Root>
  );
}

export default memo(CardOption);
