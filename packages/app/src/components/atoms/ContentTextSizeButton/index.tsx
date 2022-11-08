import React, { FC, ReactNode, useMemo, MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { ESS_FONT_SIZES } from '^/constants/cesium';
import dsPalette from '^/constants/ds-palette';
import ESSTextMediumSvg from '^/assets/icons/contents-list/ess-text-medium.svg';
import ESSTextSmallSvg from '^/assets/icons/contents-list/ess-text-small.svg';
import ArrowSmallSvg from '^/assets/icons/contents-list/arrow-small.svg';
import { PatchESSContent } from '^/store/duck/ESSContents';
import * as T from '^/types';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';

export enum Direction {
  INCREASE = 'increase',
  DECREASE = 'decrease',
}

const Root = styled.div<{ direction: Direction }>({
  display: 'flex',
  cursor: 'pointer',
  borderRadius: '3px',
  position: 'relative',

  '&:hover': {
    backgroundColor: dsPalette.grey20.toString(),
  },
}, ({ direction }) => ({
  padding: direction === Direction.INCREASE ? '4px 3px' : '6px 5px',
}));

const SvgContainer = styled.div<{ direction: Direction }>({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const ArrowContainer = styled.div<{ direction: Direction }>({
  position: 'relative',
  width: '6px',
  height: '100%',

  '> svg': {
    position: 'absolute',
  },
}, ({ direction }) => ({
  '> svg': direction === Direction.DECREASE
    ? {
      transform: 'rotate(180deg)',
      left: '-1px',
      top: '-1px',
    }
    : {
      left: '0px',
      top: '1px',
    },
}));

export interface Props {
  readonly content: T.ESSTextContent;
  readonly direction: Direction;
}

const ContentTextSizeButton: FC<Props> = ({ content, direction }) => {
  const dispatch: Dispatch = useDispatch();
  const selectedFontSizeIndex: number = useMemo(() => ESS_FONT_SIZES.findIndex((num) => num === content.info.fontSize) || 0, [content.info.fontSize]);

  const icon: ReactNode = (() => {
    switch (direction) {
      case Direction.DECREASE: {
        return <ESSTextSmallSvg />;
      }
      case Direction.INCREASE: {
        return <ESSTextMediumSvg />;
      }
      default: {
        exhaustiveCheck(direction);
      }
    }
  })();

  const handleFontSizeClick: ((e: MouseEvent<HTMLDivElement>) => void) | null = (e) => {
    e.stopPropagation();

    switch (direction) {
      case Direction.INCREASE: {
        if (selectedFontSizeIndex < ESS_FONT_SIZES.length - 1) {
          dispatch(PatchESSContent({
            content: {
              id: content.id,
              info: { fontSize: ESS_FONT_SIZES[selectedFontSizeIndex + 1] },
            },
          }));
        }
        break;
      }
      case Direction.DECREASE: {
        if (selectedFontSizeIndex > 0) {
          dispatch(PatchESSContent({
            content: {
              id: content.id,
              info: { fontSize: ESS_FONT_SIZES[selectedFontSizeIndex - 1] },
            },
          }));
        }
        break;
      }
      default: {
        exhaustiveCheck(direction);
      }
    }
  };

  return (
    <Root
      direction={direction}
      onClick={handleFontSizeClick}
      data-ddm-track-action='ess-tools-click'
      data-ddm-track-label={`btn-font-size-increase-${direction}`}
    >
      <SvgContainer direction={direction}>
        {icon}
      </SvgContainer>
      <ArrowContainer direction={direction}>
        <ArrowSmallSvg />
      </ArrowContainer>
    </Root>
  );
};

export default ContentTextSizeButton;
