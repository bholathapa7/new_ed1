import React, {
  ReactElement,
  ReactNode,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  MouseEvent,
  SyntheticEvent,
  MutableRefObject,
} from 'react';
import ScrollBars from 'react-custom-scrollbars';
import styled from 'styled-components';

import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { Global } from '^/constants/zindex';
import { UseState, useClickOutside } from '^/hooks';

const ATTACH_FILE_INPUT_ID: string = 'ATTACH_FILE_INPUT';


const Button = styled.button({
  position: 'relative',

  width: '100%',
  height: '100%',

  cursor: 'pointer',

  fontSize: '13px',
  color: dsPalette.title.toString(),
  backgroundColor: palette.itemBackground.toString(),

  borderRadius: '6px',
});

const ItemsWrapper = styled.ul({
  listStyle: 'none',

  width: '100%',

  position: 'absolute',
  left: 0,
  top: 0,
  zIndex: Global.ATTACH_DROPDOWN,

  backgroundColor: palette.itemBackground.toString(),
  borderRadius: '6px',
});

const OptionsWrapper = styled.ul({
  listStyle: 'none',
});

const InputLabel = styled.label.attrs({
  htmlFor: ATTACH_FILE_INPUT_ID,
})({
  display: 'flex',
  alignItems: 'center',

  width: '100%',
  height: '100%',

  cursor: 'pointer',
});

const Item = styled.li({
  boxSizing: 'border-box',

  width: '100%',
  height: '31px',

  paddingLeft: '12px',

  display: 'flex',
  alignItems: 'center',

  cursor: 'pointer',
});

const ItemText = styled.span({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const InputItem = styled(Item)({
  borderBottom: `1px solid ${palette.Photo.photoTabButtonBackground.toString()}`,
});

const NoItem = styled(Item)({
  color: palette.Photo.photoTabButtonBackground.toString(),

  cursor: 'auto',
});


export interface Option {
  text: string;
  value: string;
}

export interface Props {
  readonly text: string;
  readonly options: Option[];
  readonly noOptionText: string;
  readonly fileExtension: string;
  readonly attachFileText: string;
  onClick(value: Option['value']): void;
  onAttach(file: File): void;
}

function AttachDropdown({
  text, options, noOptionText, fileExtension, attachFileText,
  onClick, onAttach,
}: Props): ReactElement {
  const [isOpened, setIsOpened]: UseState<boolean> = useState<boolean>(false);
  const buttonRef: MutableRefObject<HTMLButtonElement | null> = useRef(null);

  const handleButtonClickOutside: () => void = useCallback(() => {
    if (isOpened) {
      setIsOpened(false);
    }
  }, [isOpened]);
  useClickOutside({
    ref: buttonRef,
    callback: handleButtonClickOutside,
  });

  const handleButtonClick = useCallback(() => {
    setIsOpened(true);
  }, []);

  const handleAttach: (e: SyntheticEvent<HTMLInputElement>) => void = useCallback((e) => {
    const file: File | undefined | null = e.currentTarget.files?.item(0);

    if (file) {
      onAttach(file);

      setIsOpened(false);
    }
  }, [onAttach]);

  const handleOptionClick: (value: string) => void = useCallback((value) => {
    onClick(value);

    setIsOpened(false);
  }, [onClick]);

  const input: ReactNode = useMemo(() => (
    <InputItem>
      <InputLabel>{attachFileText}</InputLabel>
      <input
        style={{ display: 'none' }}
        id={ATTACH_FILE_INPUT_ID}
        type='file'
        accept={fileExtension}
        onChange={handleAttach}
      />
    </InputItem>
  ), [attachFileText, fileExtension, handleAttach]);

  const optionsElement: ReactNode = useMemo(() => options.length > 0 ? options.map((option, index) => {
    const handleClick: (e: MouseEvent<HTMLLIElement>) => void = (e) => {
      e.stopPropagation();
      handleOptionClick(option.value);
    };

    return (
      <Item key={index} onClick={handleClick}>
        <ItemText>{option.text}</ItemText>
      </Item>
    );
  }) : (
    <NoItem>
      <ItemText>{noOptionText}</ItemText>
    </NoItem>
  ), [options, noOptionText, handleOptionClick]);

  const itemsElement: ReactNode = useMemo(() => isOpened ? (
    <ItemsWrapper>
      {input}
      <OptionsWrapper>
        <ScrollBars autoHeight={true}>{optionsElement}</ScrollBars>
      </OptionsWrapper>
    </ItemsWrapper>
  ) : null, [isOpened, input, optionsElement]);

  return (
    <Button ref={buttonRef} onClick={handleButtonClick}>
      <>{text}</>
      {itemsElement}
    </Button>
  );
}

export default memo(AttachDropdown);
