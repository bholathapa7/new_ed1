import React, { FC, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { Option as DropdownOption } from '^/components/atoms/Dropdown';
import { DesignDXFDropdown } from '^/components/organisms/DesignDXFDropdown';
import dsPalette from '^/constants/ds-palette';
import { UseL10n, useGetAllContentsOf, useL10n } from '^/hooks';
import { RequestVolumeCalculation } from '^/store/duck/Contents';
import { ChangePreviewingDesignId } from '^/store/duck/Pages';
import * as T from '^/types';
import Text from './text';

const HeaderWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

const ItemWrapper = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
});

const Title = styled.span({
  fontSize: '12px',
  color: dsPalette.title.toString(),
});

const DisableTextWrapper = styled.div({
  lineHeight: 1.55,
  fontSize: '11px',
});

interface Props {
  content: T.VolumeContent;
}

export const Design: FC<Props> = ({ content, children }) => {
  const [l10n]: UseL10n = useL10n();
  const dispatch: Dispatch = useDispatch();
  const isDbvcAvailable: boolean = useGetAllContentsOf(T.ContentsQueryParam.TYPE)(T.ContentType.DESIGN_DXF).length > 0;

  const handleDropdownSelect: (option: DropdownOption) => void = (option) => {
    const designDxfId: T.DesignDXFContent['id'] = option.value as T.DesignDXFContent['id'];
    const isSameDesignDxfSelected: boolean = content.info.calculatedVolume.calculation.type === T.VolumeCalcMethod.DESIGN &&
      content.info.calculatedVolume.calculation.designDxfId === designDxfId;
    handleDropdownLeave();

    /**
     * @desc this statement will block to send duplicated request
     */
    if (isSameDesignDxfSelected) return;

    dispatch(RequestVolumeCalculation({
      contentId: content.id,
      info: {
        type: T.VolumeCalcMethod.DESIGN,
        designDxfId,
        volumeAlgorithm: T.BasicCalcBasePlane.CUSTOM,
        volumeElevation: 0,
      },
    }));
  };

  const handleDropdownHover: (option: DropdownOption, index: number) => void = (option) => {
    dispatch(ChangePreviewingDesignId({ designId: option.value as number }));
  };

  const handleDropdownLeave: () => void = () => {
    dispatch(ChangePreviewingDesignId({}));
  };

  const item: ReactNode = isDbvcAvailable ? (
    <ItemWrapper>
      <Title>
        {l10n(Text.title.design)}
      </Title>
      <DesignDXFDropdown
        content={content}
        onSelect={handleDropdownSelect}
        onDropdownItemMouseEnter={handleDropdownHover}
        onDropdownMouseLeave={handleDropdownLeave}
        isSearchEnabled={true}
        isViolationCheckNeeded={true}
      />
    </ItemWrapper>
  ) : (
    <DisableTextWrapper>
      {l10n(Text.disabled.dbvc)}
    </DisableTextWrapper>
  );

  return (
    <>
      <HeaderWrapper>
        {item}
      </HeaderWrapper>
      {children}
    </>
  );
};
