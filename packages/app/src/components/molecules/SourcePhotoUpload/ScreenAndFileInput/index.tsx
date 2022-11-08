import WarningAlert from '^/components/atoms/WarningAlert';
import React, { ReactElement, ReactNode, memo, useMemo, Dispatch, SetStateAction } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { fileExtensions } from '^/components/organisms/AttachUploadPopup/fileInformation';
import { UseL10n, useL10n } from '^/hooks';
import { getContentOverwriteCondition } from '^/store/duck/Contents/contentOverwriteManager';
import dsPalette from '^/constants/ds-palette';
import * as T from '^/types';
import { DateScreenInput } from '../../DateScreenInput';
import { FileInput } from '../../FileInput';
import Text from './text';


const Item = styled.li({
  margin: '30px',
  marginBottom: '16px',
});

const Label = styled.p({
  fontSize: '14px',
  fontWeight: 'bold',
  marginBottom: '10px',

  color: dsPalette.title.toString(),
});


export interface Props {
  readonly screen: T.Screen | undefined;
  readonly files: File[];
  readonly hasFilesError?: boolean;
  readonly hasScreenError?: boolean;
  // todo: change this to like other handle functions
  setFiles: Dispatch<SetStateAction<File[]>>;
  onScreenChange(screen: T.Screen): void;
  onScreenError?(hasError: boolean): void;
}

function ScreenAndFileInput({
  hasFilesError = false,
  screen, files,
  hasScreenError = false, onScreenError,
  onScreenChange, setFiles,
}: Props): ReactElement {
  const [l10n]: UseL10n = useL10n();

  const isOverwritingNeeded: boolean = useSelector((s: T.State) => {
    if (screen === undefined) return false;

    return getContentOverwriteCondition({
      contents: s.Contents.contents, screenId: screen.id, attachmentType: T.AttachmentType.SOURCE,
    });
  });

  const warningElement: ReactNode = useMemo(() => isOverwritingNeeded ? (
    <Item>
      <WarningAlert texts={[l10n(Text.overwritingWarning)]} />
    </Item>
  ) : null, [isOverwritingNeeded]);

  return (
    <>
      <Item key='screen'>
        <Label>{l10n(Text.datasetDateAndName)}</Label>
        <DateScreenInput
          hasError={hasScreenError}
          onError={onScreenError}
          buttonType={T.DateScreenButton.MAP_CONTENTS_UPLOAD}
          placement={T.ModalPlacement.BOTTOM_RIGHT}
          screen={screen}
          onScreenChange={onScreenChange}
        />
      </Item>
      <Item key='files'>
        <FileInput
          hasError={hasFilesError}
          hasMultipleFiles={true}
          extensions={fileExtensions.source}
          files={files}
          setFiles={setFiles}
        />
      </Item>
      {warningElement}
    </>
  );
}

export default memo(ScreenAndFileInput);
