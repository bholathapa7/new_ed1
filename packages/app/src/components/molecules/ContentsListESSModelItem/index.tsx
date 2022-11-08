import React, { FC, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { ContentsListItem, HorizontalDivider } from '^/components/atoms/ContentsListItem';
import ToggleSlider from '^/components/atoms/ToggleSlider';
import dsPalette from '^/constants/ds-palette';
import { useL10n, UseL10n } from '^/hooks';
import { GetESSAttachments } from '^/store/duck/ESSAttachments';
import { ChangeESSModelContentWorkRadiusViz } from '^/store/duck/ESSContents';
import * as T from '^/types';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import ContentAttachments from '../ContentAttachments';
import ContentDescription from '../ContentDescription';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import { Fallback } from './fallback';
import Text from './text';

const ToolContainer = styled.div({
  margin: '-14px 0 0 36px',
});

const ToggleContainer = styled.div({
  boxSizing: 'border-box',
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const ToggleLabel = styled.p({
  fontSize: '12px',
  lineHeight: '17px',
  color: dsPalette.title.toString(),
});

export interface Props {
  content: T.ESSModelContent;
  isPinned?: boolean;
}

const RawContentsListESSModelItem: FC<Props> = ({ content, isPinned = false }) => {
  const [l10n]: UseL10n = useL10n();
  const dispatch: Dispatch = useDispatch();
  const isEditing: boolean = useSelector((s: T.State) => content.id === s.Pages.Contents.editingContentId);

  const model: T.ESSModelInstance | undefined = useSelector((s: T.State) => {
    if (!content) return undefined;

    return s.ESSModels.byId?.[content.info.modelId];
  });

  useEffect(() => {
    if (isEditing) {
      dispatch(GetESSAttachments({ contentId: content.id }));
    }
  }, [isEditing]);

  const toggleWorkRadiusVis: () => void = useCallback(() => {
    dispatch(
      ChangeESSModelContentWorkRadiusViz({
        id: content.id,
        isWorkRadiusVisEnabled: !content?.info.isWorkRadiusVisEnabled,
      }),
    );
  }, [content?.info.isWorkRadiusVisEnabled]);

  const workRadiusToggle: ReactNode = useMemo(() => {
    if (!model?.workRadius) {
      return null;
    }

    return (
      <>
        <HorizontalDivider />
        <ToggleContainer>
          <ToggleLabel>{l10n(Text.workRadiusToggleLabel)}</ToggleLabel>
          <ToggleSlider
            enabled={!!content?.info.isWorkRadiusVisEnabled}
            onClick={toggleWorkRadiusVis}
          />
        </ToggleContainer>
      </>
    );
  }, [model?.workRadius, content?.info.isWorkRadiusVisEnabled]);

  return (
    <ContentsListItem
      isPinned={isPinned}
      className={CANCELLABLE_CLASS_NAME}
      content={content}
    >
      <ToolContainer>
        <ContentDescription content={content} />
        <ContentAttachments content={content} />
      </ToolContainer>
      {workRadiusToggle}
    </ContentsListItem>
  );
};

export const ContentsListESSModelItem: FC<Props> = withErrorBoundary(RawContentsListESSModelItem)(Fallback);
