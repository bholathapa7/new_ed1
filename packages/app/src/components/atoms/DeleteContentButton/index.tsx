import React, { FC, MouseEvent } from 'react';
import styled from 'styled-components';

import DeleteSvg from '^/assets/icons/delete.svg';
import palette from '^/constants/palette';
import { UseDeleteContent, useDeleteContent } from '^/hooks';
import * as T from '^/types';

export interface Props {
  readonly content: T.Content;
  readonly isDisabled: boolean;
}

const DeleteSvgWrapper = styled.div<{ isDisabled: boolean }>(({ isDisabled }) => ({
  ' > svg > path': {
    fill: isDisabled ? palette.iconDisabled.toString() : '',
  },
}));
DeleteSvgWrapper.displayName = 'DeleteSvgWrapper';


const DeleteContentButton: FC<Props> = ({ content, isDisabled }) => {
  const deleteContent: UseDeleteContent = useDeleteContent();

  const handleDeleteContent: (e: MouseEvent<HTMLOrSVGElement>) => void = (e) => {
    if (isDisabled) return;
    e.stopPropagation();

    deleteContent(content.id, content.type);
  };

  return (
    <DeleteSvgWrapper isDisabled={isDisabled}>
      <DeleteSvg data-testid='delete-svg-button' onClick={handleDeleteContent} />
    </DeleteSvgWrapper>
  );
};

export default DeleteContentButton;
