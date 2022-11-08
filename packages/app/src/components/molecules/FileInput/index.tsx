import * as _ from 'lodash-es';
import React, { FC, HTMLAttributes, ReactNode, useEffect, useMemo, useRef, Dispatch, SyntheticEvent, SetStateAction, MutableRefObject } from 'react';
import styled from 'styled-components';

import DeleteSvg from '^/assets/icons/close-new-thin.svg';
import DeleteAllSvg from '^/assets/icons/delete.svg';
import AttachSvg from '^/assets/icons/upload-popup/attach-file.svg';
import WrapperHoverable, {
  Props as WrapperHoverableProps,
} from '^/components/atoms/WrapperHoverable';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { UseL10n, useL10n, usePrevProps } from '^/hooks';
import { fileNeq } from '^/utilities/file-util';
import formatValue from '^/utilities/value-format';
import Text from './text';

interface Validation {
  hasError: boolean;
}

export const TextLabel = styled.p({
  fontSize: '14px',
  fontWeight: 'bold',
  marginBottom: '10px',

  color: dsPalette.title.toString(),
});

const Wrapper = styled.div<Validation>(({ hasError }) => ({
  width: 'calc(100% - 1px)',

  // eslint-disable-next-line no-magic-numbers
  backgroundColor: (hasError ? palette.UploadPopup.error : palette.white).alpha(0.05).toString(),
  border: `1px solid ${palette.UploadPopup[hasError ? 'error' : 'inputBorder'].toString()}`,
  borderRadius: '5px',

  marginBottom: '7px',
}));

const InputId: HTMLAttributes<HTMLInputElement>['id'] = 'upload-popup-input';
const Input = styled.input.attrs({
  id: InputId,
  type: 'file',
})({
  display: 'none',
});

const Label = styled.label.attrs({
  htmlFor: InputId,
})<Validation>(({ hasError }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  height: '35px',
  paddingLeft: '12px',
  paddingRight: '11px',

  fontSize: '13px',
  color: (hasError ? palette.UploadPopup.error : palette.dividerLight).toString(),

  cursor: 'pointer',

  path: {
    fill: hasError ? palette.UploadPopup.error.toString() : undefined,
  },
}));

const ITEM_HEIGHT: number = 28;
const LIST_MAX_ITEM: number = 3;
const List = styled.ul({
  maxHeight: `${ITEM_HEIGHT * LIST_MAX_ITEM}px`,
  overflowY: 'scroll',

  '> li + li': {
    borderTop: `1px solid ${palette.UploadPopup.inputBorder.toString()}`,
  },
});

const Item = styled.li({
  height: `${ITEM_HEIGHT}px`,

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  position: 'relative',

  paddingLeft: '36px',
  paddingRight: '36px',
});

const ItemName = styled.span({
  marginRight: '13px',

  fontSize: '13px',
  color: 'var(--color-theme-primary)',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
});

const ItemSize = styled.span({
  fontSize: '13px',
  fontWeight: 500,
  color: dsPalette.title.toString(),
  whiteSpace: 'nowrap',
});

const DeleteIcon = styled(DeleteSvg)({
  position: 'absolute',
  left: '3px',
  top: 'calc(-12px + 50%)',

  transform: 'scale(0.35) translateY(-50%)',

  cursor: 'pointer',

  '> path': {
    fill: dsPalette.title.toString(),
  },
});

const Extension = styled.p<Validation>(({ hasError }) => ({
  color: (hasError ? palette.UploadPopup.error : palette.font).toString(),
  fontSize: '12px',
  fontWeight: 500,
}));

const tooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: { position: 'relative' },
  tooltipArrowStyle: {
    left: '50%',
    transform: 'translate(-50%)',
  },
  tooltipBalloonStyle: {
    left: '50%',
    transform: 'translate(-50%, 3px)',
    bottom: 'auto',

    fontWeight: 'bold',
  },
};

export interface Props {
  readonly hasError?: boolean;
  readonly hasMultipleFiles?: boolean;
  readonly extensions: Array<string>;
  readonly files: Array<File>;
  setFiles: Dispatch<SetStateAction<Array<File>>>;
}

export const FileInput: FC<Props> = ({
  hasError = false, hasMultipleFiles = false,
  extensions, files, setFiles,
}) => {
  const [l10n]: UseL10n = useL10n();
  const listRef: MutableRefObject<HTMLUListElement | null> = useRef(null);
  const prevFiles: Array<File> | undefined = usePrevProps<Array<File>>(files);

  const isFileAttached: boolean = files.length !== 0;
  const extensionsText: string = useMemo(() => extensions.map((extension) => extension.replace('.', '').toUpperCase()).join(', '), [extensions]);

  useEffect(() => {
    const areFilesOverLimit: boolean = Boolean(prevFiles && prevFiles.length < files.length && files.length > LIST_MAX_ITEM);

    if (areFilesOverLimit) {
      listRef?.current?.scrollTo(0, files.length * ITEM_HEIGHT);
    }
  }, [files.length]);

  const onAttach: (e: SyntheticEvent<HTMLInputElement>) => void = (e) => {
    if (e.currentTarget.files && e.currentTarget.files.length) {
      const eventFiles: Array<File> = [...e.currentTarget.files];

      setFiles((prevState) => hasMultipleFiles ? [...prevState, ...eventFiles] : [...eventFiles]);
    }
  };

  const onDeleteAllClick: (e: MouseEvent) => void = (e) => {
    e.preventDefault();

    setFiles([]);
  };

  const fileToItem: (file: File, idx: number) => ReactNode = (file, index) => {
    const onDeleteClick: () => void = () => {
      setFiles((prevState) => _.filter(prevState, fileNeq(file)));
    };

    return (
      <Item key={index}>
        <DeleteIcon onClick={onDeleteClick} />
        <ItemName>{file.name}</ItemName>
        <ItemSize>{formatValue(file.size, { unit: 'B', gap: 1024, digit: 2 })}</ItemSize>
      </Item>
    );
  };

  const placeholder: ReactNode = !isFileAttached ?
    <>{l10n(Text.attachFileNotification)}</> : undefined;

  const deleteAllIcon: ReactNode = isFileAttached ? (
    <WrapperHoverable
      title={l10n(Text.tooltipDeleteAll)}
      customStyle={tooltipCustomStyle}
    >
      <DeleteAllSvg onClick={onDeleteAllClick} />
    </WrapperHoverable>
  ) : undefined;

  const attachIcon: ReactNode = (
    <WrapperHoverable
      title={l10n(Text.attachFile)}
      customStyle={tooltipCustomStyle}
    >
      <AttachSvg />
    </WrapperHoverable>
  );

  const fileInput: ReactNode = hasMultipleFiles ? (
    <>
      <Label hasError={hasError}>
        {deleteAllIcon}
        {placeholder}
        {attachIcon}
      </Label>
      <List ref={listRef}>
        {files.map(fileToItem)}
      </List>
    </>
  ) : (
    <Label hasError={hasError}>
      {placeholder}
      {files.length > 0 ? <ItemName>{files[0].name}</ItemName> : undefined}
      {attachIcon}
    </Label>
  );

  return (
    <>
      <TextLabel>{l10n(Text.attachFile)}</TextLabel>
      <Wrapper hasError={hasError}>{fileInput}</Wrapper>
      <Extension hasError={hasError}>{l10n(Text.fileExtensionNotification)}{extensionsText}</Extension>
      <Input
        accept={extensions.join(', ')}
        multiple={hasMultipleFiles}
        onChange={onAttach}
      />
    </>
  );
};
