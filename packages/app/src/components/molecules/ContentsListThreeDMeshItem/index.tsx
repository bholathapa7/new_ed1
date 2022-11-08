import React, { FC, useCallback, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { ContentsListItem as Item } from '^/components/atoms/ContentsListItem';
import SingleSlider from '^/components/atoms/SingleSlider';
import { DEFAULT_OPACITY } from '^/constants/defaultContent';
import { DISABLED_CONTENT_OPACITY, FontFamily } from '^/constants/styles';
import { UseL10n, UseState, useConstant, useL10n } from '^/hooks';
import { PatchContent, UpdateContentConfig, contentsSelector } from '^/store/duck/Contents';
import { ChangeIn3D, ChangeIn3DPointCloud } from '^/store/duck/Pages';
import * as T from '^/types';
import { getSingleContentId } from '^/utilities/state-util';
import Text from './text';

const SINGLE_SLIDER_MIN_VALUE: number = 0;
const SINGLE_SLIDER_MAX_VALUE: number = 100;


const Opacity = styled.div({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'flex-start',

  marginTop: '13px',
});

const OpacityText = styled.div<{ isDisabled: boolean }>(({ isDisabled }) => ({
  opacity: isDisabled ? DISABLED_CONTENT_OPACITY : 1,
  marginBottom: '13px',

  color: 'var(--color-theme-primary)',
  fontFamily: FontFamily.ROBOTO,
  fontSize: '15px',
  fontWeight: 500,
}));


interface SelectorState {
  isIn3D: T.ContentsPageState['in3D'];
  isInPointcloud: T.ContentsPageState['in3DPointCloud'];
  editingContentId: T.ContentsPageState['editingContentId'];
}

export interface Props {
  readonly content: T.ThreeDMeshContent;
}

export const ContentsListThreeDMeshItem: FC<Props> = ({
  content,
}) => {
  const dispatch: Dispatch = useDispatch();

  const contentId: T.Content['id'] = useConstant<T.Content['id']>(() => content.id);

  const { isIn3D, isInPointcloud, editingContentId }: SelectorState = useSelector((state: T.State) => ({
    isIn3D: state.Pages.Contents.in3D,
    isInPointcloud: state.Pages.Contents.in3DPointCloud,
    editingContentId: state.Pages.Contents.editingContentId,
  }), shallowEqual);
  const isSelected: boolean = useSelector(({ Contents, ProjectConfigPerUser }: T.State) =>
    contentsSelector.isSelected(Contents, ProjectConfigPerUser)(contentId));
  const threeDOrthoId: T.ThreeDOrthoContent['id'] | undefined = useSelector(({ Contents, Pages, ProjectConfigPerUser }: T.State) =>
    getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.THREE_D_ORTHO));
  const is3DOrthoSelected: boolean = useSelector(({ Contents, ProjectConfigPerUser }: T.State) =>
    contentsSelector.isSelected(Contents, ProjectConfigPerUser)(threeDOrthoId));
  const pointcloudId: T.PointCloudContent['id'] | undefined = useSelector(({ Contents, Pages, ProjectConfigPerUser }: T.State) =>
    getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.POINTCLOUD));
  const isPointcloudSelected: boolean = useSelector(({ Contents, ProjectConfigPerUser }: T.State) =>
    contentsSelector.isSelected(Contents, ProjectConfigPerUser)(pointcloudId));

  const [l10n]: UseL10n = useL10n();

  const [opacity, setOpacity]: UseState<T.ThreeDMeshConfigPerUser['opacity']> = useState<T.ThreeDMeshConfigPerUser['opacity']>(
    content.config?.opacity !== undefined ? content.config.opacity : DEFAULT_OPACITY,
  );

  const isProcessingOrFailed: boolean = contentsSelector.isProcessingOrFailedByContent(content);

  useEffect(() => {
    if (isSelected && !isIn3D) {
      dispatch(PatchContent({
        content: {
          id: contentId,
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
    if (pointcloudId !== undefined && isPointcloudSelected) {
      dispatch(PatchContent({
        content: {
          id: pointcloudId,
          config: {
            selectedAt: undefined,
          },
        },
      }));
    }
    if (threeDOrthoId !== undefined && is3DOrthoSelected) {
      dispatch(PatchContent({
        content: {
          id: threeDOrthoId,
          config: {
            selectedAt: undefined,
          },
        },
      }));
    }
  }, [editingContentId]);

  useEffect(() => {
    dispatch(UpdateContentConfig({
      contentId,
      config: {
        ...content.config,
        type: T.ContentType.THREE_D_MESH,
        opacity,
      },
    }));
  }, [opacity]);

  const handleOpacityChange: (opacity: T.ThreeDMeshConfigPerUser['opacity']) => void = useCallback((changingOpacity) => {
    setOpacity(changingOpacity);
  }, []);
  const handleOpacityMouseUp: () => void = useCallback(() => {
    dispatch(PatchContent({
      content: {
        id: contentId,
        config: {
          type: T.ContentType.THREE_D_MESH,
          opacity,
        },
      },
    }));
  }, [opacity]);

  return (
    <Item content={content} firstBalloonTitle={l10n(Text.firstBalloonTitle)}>
      <Opacity>
        <OpacityText isDisabled={isProcessingOrFailed}>{opacity.toFixed(0)}%</OpacityText>
        <SingleSlider
          minValue={SINGLE_SLIDER_MIN_VALUE}
          maxValue={SINGLE_SLIDER_MAX_VALUE}
          value={opacity}
          onChange={handleOpacityChange}
          onMouseUp={handleOpacityMouseUp}
          isDisabled={isProcessingOrFailed}
        />
      </Opacity>
    </Item>
  );
};
