import _ from 'lodash-es';
import React, { HTMLProps, useRef, useState, FC, useEffect } from 'react';
import styled, { CSSObject } from 'styled-components';

interface WrapperProps {
  readonly customStyle: CSSObject;
}

const Wrapper = styled.div<WrapperProps>(({ customStyle }) => ({
  ...customStyle,
  position: 'relative',
}));

interface DisplayProps {
  readonly customStyle: CSSObject;
  readonly height: number;
}

const Display = styled.textarea<DisplayProps>(({ height, customStyle }) => ({
  width: '100%',

  ...customStyle,
  height: `${height}px`,
  overflowY: 'hidden',
  resize: 'none',
}));

interface ShadowProps {
  readonly customStyle: CSSObject;
}

const Shadow = styled.textarea<ShadowProps>(({ customStyle }) => ({
  width: '100%',

  ...customStyle,
  position: 'absolute',
  top: 0,
  left: 0,
  overflowY: 'hidden',
  visibility: 'hidden',
}));

export interface Props extends HTMLProps<HTMLTextAreaElement> {
  readonly value: string;
  readonly customStyle?: CSSObject;
  readonly className?: string;
  readonly wrapperStyle?: CSSObject;
}

export interface State {
  readonly height: number;
}

/**
 * Using props here instead of destructuring because it is needed by displayProps variable
 */
const AutosizeTextarea: FC<Props> = (props) => {
  const shadow = useRef<HTMLTextAreaElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    const shadowTextArea: HTMLTextAreaElement | null = shadow.current;

    if (shadowTextArea !== null &&
        height !== shadowTextArea.scrollHeight) {
      setHeight(shadowTextArea.scrollHeight);
    }
  });

  const displayProps: Omit<Props, 'customStyle' | 'ref' | 'as'> =
    _.omit(props, 'customStyle', 'ref', 'as');

  const getStyles: (style?: CSSObject) => CSSObject = (style) => style !== undefined ? style : {};

  return (
    <div className={props.className}>
      <Wrapper
        customStyle={getStyles(props.wrapperStyle)}
      >
        <Display
          {...displayProps}
          value={props.value}
          height={height}
          customStyle={getStyles(props.customStyle)}
          data-testid='display-textarea'
        />
        <Shadow
          value={props.value}
          customStyle={getStyles(props.customStyle)}
          ref={shadow}
          readOnly={true}
          data-testid='shadow-textarea'
        />
      </Wrapper>
    </div>
  );
};
export default AutosizeTextarea;
