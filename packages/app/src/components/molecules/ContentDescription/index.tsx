import React, { FC, MutableRefObject, memo, useCallback, useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { UseInput, UseL10n, UseState, useClickOutside, useInput, useL10n, usePrevProps } from '^/hooks';
import { PatchContent } from '^/store/duck/Contents';
import { PatchESSContent } from '^/store/duck/ESSContents';
import * as T from '^/types';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';

import Text from './text';

const Root = styled.div({
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginBottom: '22px',
});

const ContentTitle = styled.span({
  fontSize: '12px',
  color: dsPalette.title.toString(),
});

const Description = styled.input({
  boxSizing: 'border-box',

  width: '100%',
  height: '30.8px',

  marginTop: '10px',
  paddingLeft: '10.4px',

  borderRadius: '5px',
  border: `1px solid ${palette.ContentsList.inputBorder.toString()}`,

  fontSize: '12px',
  color: dsPalette.title.toString(),

  '::placeholder': {
    color: palette.dividerLight.toString(),
  },

  ':hover': {
    border: `solid 1px ${palette.ContentsList.hoverInputBorder.toString()}`,
  },

  ':focus': {
    border: `solid 1px ${dsPalette.title.toString()}`,
  },
});

interface Props {
  readonly content: T.MarkerContent | T.ESSModelContent;
}

const ContentAttachments: FC<Props> = ({ content }) => {
  const dispatch: Dispatch = useDispatch();
  const descRef: MutableRefObject<HTMLInputElement | null> = useRef(null);
  const [l10n]: UseL10n = useL10n();

  const [description, onDescriptionChange]: UseInput<string> = useInput(content.info?.description);
  const [isDescriptionEditing, setIsDescriptionEditing]: UseState<boolean> = useState<boolean>(false);
  const prevDescriptionEditing: boolean | undefined = usePrevProps(isDescriptionEditing);

  const onDescriptionFocus: () => void = () => {
    setIsDescriptionEditing((prevState: boolean) => !prevState);
  };

  const onDescriptionKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void = (e) => {
    if (e.key === 'Enter') {
      setIsDescriptionEditing(false);
      descRef.current?.blur();
    }
  };

  const handleDescriptionSave: () => void = useCallback(() => {
    if (description !== content.info?.description) {
      switch (content.type) {
        case T.ContentType.ESS_MODEL: {
          dispatch(PatchESSContent({ content: { id: content.id, info: { description } } }));
          break;
        }
        case T.ContentType.MARKER: {
          dispatch(PatchContent({ content: { id: content.id, info: { description } } }));
          break;
        }
        default: {
          exhaustiveCheck(content);
        }
      }
    }
  }, [content.type, description, content.info?.description]);

  useClickOutside<HTMLInputElement>({ ref: descRef, callback: () => {
    if (isDescriptionEditing) {
      setIsDescriptionEditing(false);
    }
  } });

  useEffect(() => {
    if (prevDescriptionEditing && !isDescriptionEditing) {
      handleDescriptionSave();
    }
  }, [prevDescriptionEditing, isDescriptionEditing]);

  return (
    <Root>
      <ContentTitle>{l10n(Text.title)}</ContentTitle>
      <Description
        ref={descRef}
        value={description}
        placeholder={l10n(Text.placeholder)}
        onChange={onDescriptionChange}
        onFocus={onDescriptionFocus}
        onKeyPress={onDescriptionKeyPress}
      />
    </Root>
  );
};

export default memo(ContentAttachments);
