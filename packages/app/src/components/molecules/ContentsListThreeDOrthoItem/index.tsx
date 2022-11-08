import React, { useEffect, useMemo, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { ContentsListItem } from '^/components/atoms/ContentsListItem';
import SingleSlider from '^/components/atoms/SingleSlider';
import { DEFAULT_OPACITY } from '^/constants/defaultContent';
import { DISABLED_CONTENT_OPACITY, FontFamily } from '^/constants/styles';
import { UseL10n, useL10n } from '^/hooks';
import { ChangeIn3D, ChangeIn3DPointCloud } from '^/store/duck/Pages';
import * as T from '^/types';
import { getSingleContentId } from '^/utilities/state-util';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { PatchContent, UpdateContentConfig, contentsSelector } from '^/store/duck/Contents';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import { Fallback } from './fallback';
import Text from './text';

interface DivideProps {
  readonly hasMoreSection: boolean;
}

const Opacity = styled.div<DivideProps>(({ hasMoreSection }) => ({
  height: '53.7px',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'flex-start',

  marginBottom: hasMoreSection ? '16.9px' : undefined,
  marginTop: '5.2px',
}));

const OpacityText = styled.div<{ isDisabled: boolean }>(({ isDisabled }) => ({
  opacity: isDisabled ? DISABLED_CONTENT_OPACITY : 1,
  width: '48.5px',
  height: '19px',

  color: 'var(--color-theme-primary)',
  fontFamily: FontFamily.ROBOTO,
  fontSize: '15px',
  fontWeight: 500,
  lineHeight: 1.67,
}));

const OpacitySlider = styled.div({
  width: '224px',
  height: '11px',

  clear: 'both',
  paddingTop: '7.2px',
});

interface SelectorState {
  editingContentId: T.ContentsPageState['editingContentId'];
  isInPointcloud: T.ContentsPageState['in3DPointCloud'];
  isIn3D: T.ContentsPageState['in3D'];
}

export interface Props {
  readonly content: T.ThreeDOrthoContent;
}

export const RawContentsListThreeDOrthoItem: FC<Props> = ({ content }) => {
  const dispatch: Dispatch = useDispatch();
  const [l10n]: UseL10n = useL10n();

  const { editingContentId, isInPointcloud, isIn3D }: SelectorState = useSelector((state: T.State) => ({
    editingContentId: state.Pages.Contents.editingContentId,
    isIn3D: state.Pages.Contents.in3D,
    isInPointcloud: state.Pages.Contents.in3DPointCloud,
  }));

  const isSelected: boolean = useSelector(({ Contents, ProjectConfigPerUser }: T.State) =>
    contentsSelector.isSelected(Contents, ProjectConfigPerUser)(content.id));
  const threeDMeshId: T.ThreeDMeshContent['id'] | undefined = useSelector(({ Contents, Pages, ProjectConfigPerUser }: T.State) =>
    getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.THREE_D_MESH));
  const is3DMeshSelected: boolean = useSelector(({ Contents, ProjectConfigPerUser }: T.State) =>
    contentsSelector.isSelected(Contents, ProjectConfigPerUser)(threeDMeshId));
  const pointcloudId: T.PointCloudContent['id'] | undefined = useSelector(({ Contents, Pages, ProjectConfigPerUser }: T.State) =>
    getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.POINTCLOUD));
  const isPointcloudSelected: boolean = useSelector(({ Contents, ProjectConfigPerUser }: T.State) =>
    contentsSelector.isSelected(Contents, ProjectConfigPerUser)(pointcloudId));

  const opacity: number = useMemo(() => content.config?.opacity !== undefined ? content.config.opacity : DEFAULT_OPACITY, [content.config?.opacity]);
  const isProcessingOrFailed: boolean = contentsSelector.isProcessingOrFailedByContent(content);

  useEffect(() => {
    if (!isSelected && isIn3D && !isPointcloudSelected && !is3DMeshSelected) {
      if (isInPointcloud) dispatch(ChangeIn3DPointCloud({ in3DPointCloud: false }));
      dispatch(PatchContent({
        content: {
          id: content.id,
          config: {
            selectedAt: new Date(),
          },
        },
      }));
    }
    if (isSelected && !isIn3D) {
      dispatch(PatchContent({
        content: {
          id: content.id,
          config: {
            selectedAt: undefined,
          },
        },
      }));
    }
  }, [isIn3D]);

  useEffect(() => {
    if ((editingContentId !== content.id) || !isSelected) return;
    if (!isIn3D) dispatch(ChangeIn3D({ in3D: true }));
    if (isInPointcloud) dispatch(ChangeIn3DPointCloud({ in3DPointCloud: false }));
    if (isPointcloudSelected && pointcloudId !== undefined) {
      dispatch(PatchContent({
        content: {
          id: pointcloudId,
          config: {
            selectedAt: undefined,
          },
        },
      }));
    }
    if (is3DMeshSelected && threeDMeshId !== undefined) {
      dispatch(PatchContent({
        content: {
          id: threeDMeshId,
          config: {
            selectedAt: undefined,
          },
        },
      }));
    }
  }, [editingContentId]);

  const handleMouseUp: () => void = () => {
    dispatch(PatchContent({ content: { id: content.id, config: { type: T.ContentType.THREE_D_ORTHO, opacity } } }));
  };

  const handleOpacityChange: (value: number) => void = (value) => {
    dispatch(UpdateContentConfig({ contentId: content.id, config: {
      ...content.config,
      type: T.ContentType.THREE_D_ORTHO,
      opacity: value,
    } }));
  };

  return (
    <ContentsListItem
      className={CANCELLABLE_CLASS_NAME}
      content={content}
      firstBalloonTitle={l10n(Text.firstBalloonTitle)}
    >
      <Opacity hasMoreSection={false}>
        <OpacityText isDisabled={isProcessingOrFailed}>
          {opacity.toFixed(0)}%
        </OpacityText>
        <OpacitySlider>
          <SingleSlider
            minValue={0}
            // eslint-disable-next-line no-magic-numbers
            maxValue={100}
            value={opacity}
            onChange={handleOpacityChange}
            onMouseUp={handleMouseUp}
            isDisabled={isProcessingOrFailed}
          />
        </OpacitySlider>
      </Opacity>
    </ContentsListItem >
  );
};

export const ContentsListThreeDOrthoItem: FC<Props> = withErrorBoundary(RawContentsListThreeDOrthoItem)(Fallback);
