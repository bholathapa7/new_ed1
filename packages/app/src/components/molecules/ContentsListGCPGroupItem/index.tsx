import Tippy from '@tippyjs/react';
import React, { ReactElement, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { ContentsListItem as ListItem, HorizontalDivider } from '^/components/atoms/ContentsListItem';
import { DEFAULT_COORDINATE_TITLE_TEXT } from '^/constants/coordinate';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { UseL10n, useL10n } from '^/hooks';
import { PatchContent, contentsSelector } from '^/store/duck/Contents';
import { ChangeEditingGCPIndex, ChangeIn3D } from '^/store/duck/Pages';
import * as T from '^/types';
import { getCoordinateTitles, projectionSystemLabel } from '^/utilities/coordinate-util';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import Text from './text';


const Balloon = styled.div({
  width: '100%',
});

const CoordinateText = styled.p({
  marginLeft: '10px',
  marginTop: '13px',

  fontSize: '13px',
  color: dsPalette.title.toString(),
});

const Title = styled.p({
  display: 'flex',
  alignItems: 'center',

  fontSize: '13px',
  fontWeight: 'bold',
  color: dsPalette.title.toString(),
});

const LabelList = styled.ul({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  marginTop: '9px',

  listStyle: 'none',
});

const LabelItem = styled.li({
  width: '100%',
  height: '40px',

  boxSizing: 'border-box',
  paddingLeft: '10px',

  display: 'flex',
  alignItems: 'center',

  color: dsPalette.title.toString(),
  fontSize: '14px',

  cursor: 'pointer',

  ':hover': {
    backgroundColor: palette.toggleButtonGray.toString(),
  },
});


export interface Props {
  readonly content: T.GCPGroupContent;
}

export function ContentsListGCPGroupItem({ content }: Props): ReactElement {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();

  const isIn3D: boolean = useSelector((s: T.State) => s.Pages.Contents.in3D);
  const isSelected: boolean = useSelector((s: T.State) => contentsSelector.isSelected(s.Contents, s.ProjectConfigPerUser)(content.id));

  const coordinateTitles: T.CoordinateTitle[] = useMemo(() => getCoordinateTitles(content.info.crs), [content.info.crs]);
  const numberOfGCPs: number = useMemo(() => content.info.gcps.length, [content.info.gcps.length]);

  useEffect(() => {
    if (isIn3D && isSelected) {
      dispatch(PatchContent({
        content: {
          id: content.id,
          config: { selectedAt: undefined },
        },
      }));
    }
  }, [isIn3D]);

  useEffect(() => {
    if (isSelected && isIn3D) {
      dispatch(ChangeIn3D({ in3D: false }));
    }
  }, [isSelected]);

  const handleGCPMouseEnter: (gcpIndex: number) => void = useCallback((gcpIndex) => {
    dispatch(ChangeEditingGCPIndex({ editingGCPIndex: gcpIndex }));
  }, []);
  const handleGCPMouseLeave: () => void = useCallback(() => {
    dispatch(ChangeEditingGCPIndex({}));
  }, []);

  const labelItems: ReactNode = useMemo(() => content.info.gcps.map(({ label, easting, northing, altitude }, index) => {
    const coordinateMap: { [K in T.CoordinateTitle]: number } = {
      [T.CoordinateTitle.EASTING]: easting,
      [T.CoordinateTitle.NORTHING]: northing,
      [T.CoordinateTitle.LATITUDE]: easting,
      [T.CoordinateTitle.LONGITUDE]: northing,
      [T.CoordinateTitle.ALTITUDE]: altitude,
    };
    const coordinate: string = coordinateTitles.map((title) => `${l10n(DEFAULT_COORDINATE_TITLE_TEXT[title])}: ${coordinateMap[title]}`).join(' ');

    const handleMouseEnter: () => void = () => handleGCPMouseEnter(index);

    return (
      <Tippy key={index} offset={T.TIPPY_OFFSET} theme='angelsw' placement='bottom' arrow={false} content={coordinate}>
        <LabelItem onMouseEnter={handleMouseEnter}>{label}</LabelItem>
      </Tippy>
    );
  }), [content.info.gcps, handleGCPMouseEnter, coordinateTitles, l10n]);

  return (
    <ListItem
      className={CANCELLABLE_CLASS_NAME}
      content={content}
      firstBalloonTitle={l10n(Text.coordinateSystem)}
    >
      <Balloon>
        <CoordinateText>{l10n(projectionSystemLabel[content.info.crs])}</CoordinateText>
      </Balloon>
      <HorizontalDivider />
      <Balloon>
        <Title>{`${l10n(Text.list)} (${numberOfGCPs})`}</Title>
        <LabelList onMouseLeave={handleGCPMouseLeave}>
          {labelItems}
        </LabelList>
      </Balloon>
    </ListItem>
  );
}
