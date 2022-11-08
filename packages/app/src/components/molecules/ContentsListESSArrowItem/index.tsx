import React, { FC } from 'react';

import { ContentsListItem } from '^/components/atoms/ContentsListItem';
import { UseL10n, useL10n } from '^/hooks';
import * as T from '^/types';
import { contentTexts } from '^/utilities/content-util';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import { Fallback } from './fallback';

export interface Props {
  content: T.ESSArrowContent;
  isPinned?: boolean;
}

const RawContentsListESSArrowItem: FC<Props> = ({ content, isPinned = false }) => {
  const [l10n]: UseL10n = useL10n();

  return (
    <ContentsListItem
      isPinned={isPinned}
      className={CANCELLABLE_CLASS_NAME}
      firstBalloonTitle={l10n(contentTexts[content.type])}
      content={content}
    />
  );
};

export const ContentsListESSArrowItem: FC<Props> = withErrorBoundary(RawContentsListESSArrowItem)(Fallback);
