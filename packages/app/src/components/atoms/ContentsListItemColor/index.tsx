import Color from 'color';
import React, { FC, ReactNode, useMemo, useRef, useState, MutableRefObject, MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import styled, { CSSObject } from 'styled-components';

import ColorNoFillSvg from '^/assets/icons/contents-list/color-no-fill.svg';
import RawColorPickerPopup, { Props as ColorPickerPopupProps } from '^/components/atoms/ColorPickerPopup';
import palette, { getColorPickerPalette } from '^/constants/palette';
import route from '^/constants/routes';
import { UseState, useRouteIsMatching, isESSContent } from '^/hooks';
import { PatchContent } from '^/store/duck/Contents';
import { PatchESSContent } from '^/store/duck/ESSContents';
import * as T from '^/types';
import { isTransparent, isWhite } from '^/utilities/color';

const BalloonColor = styled.div<{
  customColor: Color;
  customStyle?: CSSObject;
}>(({ customColor, customStyle }) => ({
  position: 'relative',

  marginLeft: '8px',
  padding: isWhite(customColor) || isTransparent(customColor) ? '4.5px' : '5.5px',

  borderRadius: '50%',
  backgroundColor: customColor.toString(),
  border: isWhite(customColor) || isTransparent(customColor) ? `1px solid ${palette.black.toString()}` : undefined,

  cursor: 'pointer',
  boxSizing: 'border-box',

  ...customStyle,
}));

const ColorPickerPopup = styled(RawColorPickerPopup)<ColorPickerPopupProps>({
  zIndex: 1,
  position: 'absolute',
  right: '50%',
  top: '100%',
  transform: 'translate(50%, 0)',
});

const NoFillSvgContainer = styled.div({
  position: 'absolute',
  top: '-6px',
  left: '-5px',

  '> svg': {
    transform: 'scale(0.7)',
  },
});

export interface Props {
  readonly content: T.Content;
  readonly balloonColorCustomStyle?: CSSObject;
  readonly hasWhite?: boolean;
  readonly hasNoFill?: boolean;
}

const ContentsListItemColor: FC<Props> = ({ content, balloonColorCustomStyle, hasWhite, hasNoFill }) => {
  const dispatch: Dispatch = useDispatch();
  const [isColorEditing, setIsColorEditing]: UseState<boolean> = useState<boolean>(false);
  const ref: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const isOnSharePage: boolean = useRouteIsMatching(route.share.main);

  const handleColorClick: ((e: MouseEvent<HTMLDivElement>) => void) = (e) => {
    if (isOnSharePage) return;

    e.stopPropagation();

    setIsColorEditing((prevState: boolean) => !prevState);
  };

  const handleColorEdit: (color: Color) => void = (clickedColor) => {
    if (isOnSharePage) return;

    if (clickedColor.toString() !== content.color.toString()) {
      setIsColorEditing(false);

      if (isESSContent(content)) {
        dispatch(PatchESSContent({ content: { id: content.id, color: clickedColor } }));
      } else {
        dispatch(PatchContent({ content: { id: content.id, color: clickedColor } }));
      }
    }
  };

  const handleClickPickerOutside: () => void = () => {
    if (isColorEditing) {
      setIsColorEditing(false);
    }
  };

  const paletteColors: Array<Array<Color>> = getColorPickerPalette({ hasWhite, hasNoFill });
  const colorPickerPopup: ReactNode = isColorEditing ? (
    <ColorPickerPopup
      parentRef={ref}
      colors={paletteColors}
      clickedColor={content.color}
      setColor={handleColorEdit}
      onClickOutside={handleClickPickerOutside}
    />
  ) : undefined;

  const noFillIcon: ReactNode = useMemo(() => {
    if (!content?.color || content.color.alpha() > 0) {
      return undefined;
    }

    return (
      <NoFillSvgContainer>
        <ColorNoFillSvg />
      </NoFillSvgContainer>
    );
  }, [content?.color]);

  return (
    <BalloonColor
      ref={ref}
      customColor={content.color}
      onClick={handleColorClick}
      customStyle={balloonColorCustomStyle}
      data-ddm-track-action='color-select'
      data-ddm-track-label={`btn-font-color-${content.type}`}
    >
      {noFillIcon}
      {colorPickerPopup}
    </BalloonColor>
  );
};

export default ContentsListItemColor;
