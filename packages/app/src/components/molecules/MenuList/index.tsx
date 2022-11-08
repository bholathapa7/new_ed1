import palette from '^/constants/palette';
import styled from 'styled-components';

export const MenuList = styled.ul({
  display: 'flex',
  direction: 'ltr',
  listStyle: 'none',

  '& > li + li': {
    marginLeft: '20px',
  },
});
MenuList.displayName = 'MenuList';

export interface MenuItemProps {
  readonly selected: boolean;
}
export const MenuItem = styled.li<MenuItemProps>({
  fontSize: '13px',
  lineHeight: 1,

  cursor: 'pointer',

  ':hover': {
    fontWeight: 500,
    color: palette.textGray.toString(),
  },
}, ({ selected }) => ({
  // eslint-disable-next-line no-magic-numbers
  fontWeight: selected ? 500 : 'normal',
  color: selected ? palette.textGray.toString() : palette.textLight.toString(),
}));
MenuItem.displayName = 'MenuItem';
