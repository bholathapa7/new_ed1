import React, { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import styled, { CSSObject } from 'styled-components';

import { ContentsListItem } from '^/components/atoms/ContentsListItem';
import ContentTextColorPalette from '^/components/atoms/ContentTextColorPalette';
import ContentTextSizeButton, { Direction } from '^/components/atoms/ContentTextSizeButton';
import ContentColor from '^/components/atoms/ContentsListItemColor';
import RawDropdown, {
  Option as DropdownOption,
  Props as DropdownProps,
} from '^/components/atoms/Dropdown/1';
import { ESS_FONT_SIZES } from '^/constants/cesium';
import dsPalette from '^/constants/ds-palette';
import { PatchESSContent } from '^/store/duck/ESSContents';
import * as T from '^/types';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import { Fallback } from './fallback';

const ToolContainer = styled.div({
  display: 'flex',
  margin: '-18px auto 0 32.5px',
});

const ColorContainer = styled.div({
  display: 'flex',
  alignItems: 'center',

  '> div:first-child': {
    marginRight: '2px',
    marginTop: '4px',
  },
});

const TextSizeContainer = styled.div({
  display: 'flex',

  '> div': {
    marginRight: '7px',
  },
});

// TODO: This is a specific dropdown that designer wants
// which is styled differently than the rest of the dropdown.
// This is inconsistent, but the designers will fix the inconsistencies
// once the design system is completed.
const Dropdown =
  styled(RawDropdown)<DropdownProps>({
    width: '57px',
    height: '24px',

    ' *:not(.fa)': {
      fontSize: '12px',
    },

    ' ul': {
      marginTop: '3px',
      border: 0,
      borderRadius: '3px',
      boxShadow: '2px 2px 7px rgba(0, 0, 0, 0.15)',
    },

    ' hr': {
      borderTop: '0px',
    },

    ' i': {
      color: dsPalette.grey60.toString(),
    },

    '> div > button': {
      '& > span, & > i': {
        lineHeight: '21px',
      },
    },

    ' li:hover': {
      backgroundColor: dsPalette.grey20.toString(),
      color: 'inherit',
    },

    ' li.active': {
      backgroundColor: dsPalette.categorySelect.toString(),
    },
  });

const textSizesOptions: DropdownOption[] = ESS_FONT_SIZES.map((size) => ({ text: size.toString(), value: size }));

const contentColorCustomStyle: CSSObject = {
  width: '1px',
  height: '1px',
};

export interface Props {
  content: T.ESSTextContent;
  isPinned?: boolean;
}

const RawContentsListESSTextItem: FC<Props> = ({ content, isPinned = false }) => {
  const dispatch: Dispatch = useDispatch();

  const onClick: (option: DropdownOption) => void = useCallback((option) => {
    dispatch(PatchESSContent({
      content: {
        id: content.id,
        info: { fontSize: Number(option.value) },
      },
    }));
  }, []);

  return (
    <ContentsListItem
      isPinned={isPinned}
      className={CANCELLABLE_CLASS_NAME}
      content={content}
    >
      <ToolContainer>
        <TextSizeContainer>
          <Dropdown
            value={content.info.fontSize}
            options={textSizesOptions}
            placeHolder=''
            zIndex={1}
            onClick={onClick}
            trackAction='ess-tools-click'
            trackLabel='btn-font-size-dropdown'
          />
          <ContentTextSizeButton content={content} direction={Direction.INCREASE} />
          <ContentTextSizeButton content={content} direction={Direction.DECREASE} />
        </TextSizeContainer>
        <ColorContainer>
          <ContentTextColorPalette content={content} />
          <ContentColor
            content={content}
            balloonColorCustomStyle={contentColorCustomStyle}
            hasWhite={true}
            hasNoFill={true}
          />
        </ColorContainer>
      </ToolContainer>
    </ContentsListItem>
  );
};

export const ContentsListESSTextItem: FC<Props> = withErrorBoundary(RawContentsListESSTextItem)(Fallback);
