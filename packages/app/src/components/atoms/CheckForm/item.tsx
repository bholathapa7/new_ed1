import React, { FC, useCallback } from 'react';
import styled from 'styled-components';

import { GrayBlueCheckbox as Checkbox } from '^/components/atoms/GrayBlueCheckbox';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';

export interface Item {
  id: number;
  text: string;
}


interface ErrorProp {
  readonly hasError?: boolean;
}

const Root = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '11px',
});

const Wrapper = styled.span<ErrorProp>(({ hasError }) => ({
  marginRight: '12px',
  lineHeight: '22px',

  '> svg path': {
    fill: hasError ? palette.error.toString() : undefined,
  },
}));

const Label = styled.span<ErrorProp>(({ hasError }) => ({
  fontSize: '13px',
  fontWeight: 400,
  cursor: 'pointer',
  lineHeight: '22px',

  color: hasError ? palette.error.toString() : dsPalette.typePrimary.toString(),
}));


interface Props {
  readonly item: Item;
  readonly isChecked: boolean;
  readonly hasError?: boolean;
  onClick(id: Item['id']): void;
}

const CheckFormItem: FC<Props> = ({
  item: { id, text }, isChecked, hasError, onClick,
}) => {
  const handleClick: () => void = useCallback(() => {
    onClick(id);
  }, [onClick, id]);

  return (
    <Root key={id}>
      <Wrapper hasError={hasError}>
        <Checkbox isChecked={isChecked} onClick={handleClick} />
      </Wrapper>
      <Label onClick={handleClick} hasError={hasError}>
        {text}
      </Label>
    </Root>
  );
};

export default CheckFormItem;
