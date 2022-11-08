import Color from 'color';
import React, { FC, ReactNode, useRef, MutableRefObject, MouseEvent } from 'react';
import styled from 'styled-components';

import ColorNoFillSvg from '^/assets/icons/contents-list/color-no-fill.svg';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import route from '^/constants/routes';
import { useClickOutside, useRouteIsMatching } from '^/hooks';
import { isTransparent, isWhite } from '^/utilities/color';

const Root = styled.div({
  position: 'relative',

  width: 'min-content',

  cursor: 'auto',
});

const ColorsWrapper = styled.ul({
  listStyle: 'none',

  padding: '11.5px',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'flex-start',

  borderRadius: '8px',
  // eslint-disable-next-line no-magic-numbers
  boxShadow: `0 3px 5px 0 ${palette.black.alpha(0.2).toString()}, 0 1px 12px 0 ${palette.black.alpha(0.18).toString()}`,
  backgroundColor: palette.white.toString(),

  '> li + li': {
    marginTop: '10px',
  },
});

const ColorLine = styled.li({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',

  '> div + div': {
    marginLeft: '10px',
  },
});

interface ItemProps {
  isClicked: boolean;
  customColor: Color;
}
const ColorItem = styled.div<ItemProps>(({ isClicked, customColor }) => ({
  width: isClicked || isWhite(customColor) || isTransparent(customColor) ? '15px' : '17px',
  height: isClicked || isWhite(customColor) || isTransparent(customColor) ? '15px' : '17px',

  borderRadius: '50%',
  backgroundColor: customColor.toString(),
  border: (() => {
    if (isClicked) {
      return `1px solid ${dsPalette.typePrimary.toString()}`;
    }

    return isWhite(customColor) || isTransparent(customColor)
      ? `1px solid ${dsPalette.grey20.toString()}`
      : undefined;
  })(),

  cursor: isClicked ? undefined : 'pointer',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  ' svg': {
    position: 'absolute',
    zIndex: 1,
    pointerEvents: 'none',

    transformOrigin: 'center',
    transform: isClicked ? 'scale(0.6)' : undefined,
  },

  '&::before': isClicked && !isWhite(customColor)
    ? {
      content: '\' \'',

      width: '9px',
      height: '9px',

      border: `3px solid ${palette.white.toString()}`,
      borderRadius: '50%',
      zIndex: 2,
    }
    : undefined,

  ':hover': isClicked ? undefined : {
    // eslint-disable-next-line no-magic-numbers
    border: `2px solid ${dsPalette.grey10.toString()}`,
    width: '13px',
    height: '13px',

    ' svg': {
      transform: 'scale(0.6)',
    },

    '&::before': {
      content: '\' \'',

      width: '9px',
      height: '9px',

      border: `2px solid ${palette.white.toString()}`,
      borderRadius: '50%',
      zIndex: 2,
    },
  },
}));

const ArrowWrapper = styled.div({
  position: 'relative',
  height: '7.15px',

  '::after': {
    position: 'absolute',
    left: '50%',
    bottom: '-1px',
    transform: 'translate(-50%, 0)',

    content: '\' \'',

    width: 0,
    height: 0,
    borderLeft: '6.875px solid transparent', // Half of width
    borderRight: '6.875px solid transparent',
    borderBottom: `8.15px solid ${palette.white.toString()}`, // Height
  },
});

export interface Props {
  readonly className?: string; // For styled-component overwrite from parent
  readonly parentRef?: MutableRefObject<HTMLElement | null>;
  readonly clickedColor: Color;
  readonly colors: Array<Array<Color>>;
  setColor(color: Color): void;
  onClickOutside?(): void;
}

/**
 * TODO: delete molecules/ContentsListColorItem after starting using this
 */
const ColorPickerPopup: FC<Props> = ({
  className, parentRef, clickedColor, colors, setColor, onClickOutside,
}) => {
  const ref: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const isOnSharePage: boolean = useRouteIsMatching(route.share.main);

  if (onClickOutside) {
    useClickOutside<HTMLElement>({
      ref: parentRef ? parentRef : ref,
      callback: onClickOutside,
    });
  }

  /**
   * @DESC To ignore parent's onClick event
   */
  const handleClick: (e: MouseEvent<HTMLDivElement>) => void = (e) => {
    e.stopPropagation();
  };

  const colorsLists: ReactNode = colors.map((colorsList: Array<Color>, colorsListKey: number) => {
    const oneLine: ReactNode = colorsList.map((color: Color, colorKey: number) => {
      const isClicked: boolean = clickedColor.toString() === color.toString();
      const onClick: (e: MouseEvent<HTMLDivElement>) => void = (e) => {
        if (isOnSharePage) return;

        e.stopPropagation();
        setColor(color);
      };

      return (
        <ColorItem
          key={colorKey}
          onClick={onClick}
          isClicked={isClicked}
          customColor={color}
        >
          {isTransparent(color) ? <ColorNoFillSvg /> : null}
        </ColorItem>
      );
    });

    return (
      <ColorLine key={colorsListKey}>
        {oneLine}
      </ColorLine>
    );
  });

  return (
    <Root className={className} ref={ref} onClick={handleClick}>
      <ArrowWrapper />
      <ColorsWrapper>
        {colorsLists}
      </ColorsWrapper>
    </Root>
  );
};

export default ColorPickerPopup;
