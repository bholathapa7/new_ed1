import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';

import CheckFormItem, { Item } from './item';


const Root = styled.div({
  display: 'flex',
  flexDirection: 'column',

  width: '100%',
});


interface Props {
  readonly items: Item[];
  readonly checkedItemIds: Item['id'][];
  readonly isValidated?: boolean;
  onClick(id: Item['id']): void;
}

export const CheckForm: FC<Props> = ({ items, checkedItemIds, onClick, isValidated }) => {
  const itemsElement: ReactNode = items.map((item) => {
    const isChecked: boolean = checkedItemIds.includes(item.id);

    return (
      <CheckFormItem
        key={item.id}
        item={item}
        isChecked={isChecked}
        hasError={isValidated && !isChecked}
        onClick={onClick}
      />
    );
  });

  return (
    <Root>{itemsElement}</Root>
  );
};
