import Color from 'color';
import React, { FC, ReactNode, useRef, useState, MouseEvent, MutableRefObject } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import ESSTextSmallSvg from '^/assets/icons/contents-list/ess-text-small.svg';
import RawColorPickerPopup, { Props as ColorPickerPopupProps } from '^/components/atoms/ColorPickerPopup';
import palette, { getColorPickerPalette } from '^/constants/palette';
import { PatchESSContent } from '^/store/duck/ESSContents';
import * as T from '^/types';
import { isWhite } from '^/utilities/color';

const Root = styled.div({
  position: 'relative',
  display: 'flex',
  width: '8px',
  height: '15px',
  alignItems: 'center',
  flexDirection: 'column',
  cursor: 'pointer',

  '> svg': {
    marginLeft: '1px',
  },
});

const Colorbox = styled.div<{ color: string }>({
  width: '7px',
  height: '4px',
}, ({ color }) => ({
  backgroundColor: color,
  border: isWhite(new Color(color)) ? `1px solid ${palette.black.toString()}` : undefined,
}));

const ColorPickerPopup = styled(RawColorPickerPopup)<ColorPickerPopupProps>({
  zIndex: 1,
  position: 'absolute',
  right: '50%',
  top: '100%',
  transform: 'translate(50%, 0)',
});

export interface Props {
  readonly content: T.ESSTextContent;
}

const ContentTextColorPalette: FC<Props> = ({ content }) => {
  const dispatch: Dispatch = useDispatch();
  const [isColorEditing, setIsColorEditing] = useState(false);
  const ref: MutableRefObject<HTMLDivElement | null> = useRef(null);

  const handleColorClick: ((e: MouseEvent<HTMLDivElement>) => void) | null = (e) => {
    e.stopPropagation();

    setIsColorEditing((prevState: boolean) => !prevState);
  };

  const handleColorEdit: ((color: Color) => void) | null = (clickedColor) => {
    if (clickedColor.toString() !== content.info.fontColor.toString()) {
      setIsColorEditing(false);

      dispatch(PatchESSContent({ content: { id: content.id, info: { fontColor: clickedColor } } }));
    }
  };

  const handleClickPickerOutside: () => void = () => {
    if (isColorEditing) {
      setIsColorEditing(false);
    }
  };

  const paletteColors: Array<Array<Color>> = getColorPickerPalette({ hasWhite: true });

  const colorPickerPopup: ReactNode = isColorEditing ? (
    <ColorPickerPopup
      parentRef={ref}
      colors={paletteColors}
      clickedColor={content.info.fontColor}
      setColor={handleColorEdit}
      onClickOutside={handleClickPickerOutside}
    />
  ) : undefined;

  return (
    <Root
      ref={ref}
      onClick={handleColorClick}
      data-ddm-track-action='ess-tools-click'
      data-ddm-track-label='btn-background-color'
    >
      <ESSTextSmallSvg />
      <Colorbox color={content.info.fontColor.toString()} />
      {colorPickerPopup}
    </Root>
  );
};

export default ContentTextColorPalette;
