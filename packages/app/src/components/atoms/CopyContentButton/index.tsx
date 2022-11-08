import React, { FC, MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import CopySvg from '^/assets/icons/copy.svg';
import palette from '^/constants/palette';
import { typeGuardESSContent } from '^/hooks';
import { CopyESSContent } from '^/store/duck/ESSContents';
import * as T from '^/types';
import { getCopiedContentTitle } from '^/utilities/annotation-content-util';
import { getContentTitlesByType } from '^/utilities/content-util';

export interface Props {
  readonly content: T.Content;
  readonly isDisabled: boolean;
}

const CopySvgWrapper = styled.div<Pick<Props, 'isDisabled'>>(({ isDisabled }) => ({
  '& > svg > path': {
    fill: isDisabled ? palette.iconDisabled.toString() : palette.ContentsList.balloonHeaderIconGray.toString(),
  },
  '& > svg > rect': {
    stroke: isDisabled ? palette.iconDisabled.toString() : palette.ContentsList.balloonHeaderIconGray.toString(),
  },
}));
CopySvgWrapper.displayName = 'CopySvgWrapper';

const CopyIcon = styled(CopySvg)({
  width: '13.5px',
  height: '13.5px',
});

const CopyContentButton: FC<Props> = ({ content, isDisabled }) => {
  const dispatch = useDispatch();
  const allContent = useSelector((s: T.State) => s.Contents.contents.byId);
  const editingContentId: T.ContentsPageState['editingContentId'] = useSelector((s: T.State) => s.Pages.Contents.editingContentId);

  const handleCopyContent: (e: MouseEvent<HTMLOrSVGElement>) => void = (e) => {
    if (isDisabled || content.id !== editingContentId) return;
    e.stopPropagation();

    const ESSContent: T.ESSContent | undefined = typeGuardESSContent(content);

    if (ESSContent === undefined) return;
    const allContentTitlesWithSameType = getContentTitlesByType(allContent, ESSContent.type);
    const copiedContent = {
      ...ESSContent,
      title: getCopiedContentTitle(ESSContent.title, allContentTitlesWithSameType),
    };
    dispatch(CopyESSContent({ content: copiedContent }));
  };

  return (
    <CopySvgWrapper isDisabled={isDisabled}>
      <CopyIcon data-testid='copy-svg-button' onClick={handleCopyContent} />
    </CopySvgWrapper>
  );
};

export default CopyContentButton;
