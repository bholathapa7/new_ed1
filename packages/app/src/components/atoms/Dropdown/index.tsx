/* eslint-disable max-lines */
import { autobind } from 'core-decorators';
import _ from 'lodash-es';
import React, {
  Component, FC, Fragment, ReactElement, ReactNode, RefObject, SyntheticEvent, createRef, useMemo,
  MouseEvent as ReactMouseEvent,
} from 'react';
import Scrollbars from 'react-custom-scrollbars';
import styled, { CSSObject } from 'styled-components';

import CaretSvg from '^/assets/icons/dropdown/dropdown-caret-default.svg';
import SearchSvg from '^/assets/icons/volume-calculation-method/search.svg';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { Props as TutorialWrapperHoverableProps, TutorialWrapperHoverable } from '../TutorialWrapperHoverable';

export const DEFAULT_DROPDOWN_ITEM_HEIGHT: number = 33;

export interface Option {
  leftText: string;
  value: number | string;
  rightText?: string;
  isDisabled?: boolean;
  tutorial?: TutorialWrapperHoverableProps;
}

export const createOption: (text: string) => Option = (
  text,
) => ({
  leftText: text,
  value: text,
});

export const createOptions: (texts: Array<string>) => Array<Option> = (
  texts,
) => texts.map(createOption);

const borderWidth: number = 1;

interface VerticalTrackProps {
  readonly verticalTrackStyle?: CSSObject;
}
const VerticalTrack = styled.div<VerticalTrackProps>(({ verticalTrackStyle }) => ({
  position: 'absolute',
  bottom: '2px',
  right: '4px',
  top: '2px',
  width: '6px',
  borderRadius: '3px',
  ...verticalTrackStyle,
}));

interface VerticalThumbProps {
  readonly verticalThumbStyle?: CSSObject;
}
const VerticalThumb = styled.div<VerticalThumbProps>(({ verticalThumbStyle }) => ({
  borderRadius: '3.3px',
  width: '7px !important',
  backgroundColor: palette.dropdown.thumbColor.toString(),
  ...verticalThumbStyle,
}));

interface RootProps {
  rootStyle?: CSSObject;
}

const Root = styled.div<RootProps>(({ rootStyle }) => ({
  flexShrink: 0,
  width: '135px',
  height: `${DEFAULT_DROPDOWN_ITEM_HEIGHT}px`,
  ...rootStyle,
}));

interface WrapperProps {
  readonly fontSize?: string;
  readonly zIndex?: number;
  readonly hasError?: boolean;
  readonly isOpened?: boolean;
  readonly isDisabled?: boolean;
}
const Wrapper = styled.div<WrapperProps>(({ fontSize, zIndex, hasError, isOpened, isDisabled }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',

  '> button > span': {
    color: !isOpened && hasError ? palette.error.toString() : undefined,
    marginTop: '-1px',
  },

  '& *': {
    fontSize: fontSize !== undefined ? fontSize : '11px',
    fontWeight: 500,
    color: !isDisabled ? dsPalette.title.toString() : palette.disabledFont.toString(),
  },

  zIndex,
}));

interface MainButtonProps {
  readonly mainButtonStyle?: CSSObject;
  readonly hasError?: boolean;
  readonly isOpened?: boolean;
  readonly isDisabled?: boolean;
}
const MainButton = styled.button<MainButtonProps>({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  width: '100%',
  height: '100%',

  backgroundColor: palette.ContentsList.itemBackgroundGray.toString(),
  textAlign: 'left',
  cursor: 'pointer',

  '& *': {
    width: 'unset !important',
  },
}, ({ isOpened, hasError, mainButtonStyle, isDisabled }) => {
  const buttonStyle: CSSObject = mainButtonStyle !== undefined ? {
    ...mainButtonStyle,
  } : {};

  return {
    ...buttonStyle,
    border: !isOpened && hasError ? `1px solid ${palette.error.toString()}` : undefined,
    borderRadius: !isOpened ? '6px' : '6px 6px 0px 0px',
    borderBottom: isOpened ? `1px solid ${palette.dropdown.dividerColor.toString()}` : undefined,
    backgroundColor: isDisabled ? palette.iconDisabled.toString() :
      // eslint-disable-next-line no-magic-numbers
      !isOpened && hasError ? palette.error.alpha(0.05).toString() : undefined,

    cursor: isDisabled ? 'default' : 'pointer',
  };
});

interface SearchIconProps {
  readonly searchIconStyle?: CSSObject;
}
const SearchIconWrapper = styled.span<SearchIconProps>(({ searchIconStyle }) => ({
  marginLeft: '10px',
  ...searchIconStyle,
}));

const ValueWrapper = styled.span({
  marginLeft: '10.8px',
  flexGrow: 1,

  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  pointerEvents: 'none',
  lineHeight: 'normal',
});

interface ValueEditiorProps {
  readonly valueEditorStyle?: CSSObject;
}
const ValueEditor = styled.input<ValueEditiorProps>(({ valueEditorStyle }) => ({
  marginLeft: '9px',
  flexGrow: 1,

  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  backgroundColor: 'transparent',
  lineHeight: 'normal',
  ...valueEditorStyle,
}));

interface CaretProps {
  readonly isOpened?: boolean;
  readonly hasError?: boolean;
  readonly caretStyle?: CSSObject;
}

const CaretWrapper = styled.div<CaretProps>(({ isOpened, hasError, caretStyle }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: '10px',
  '> svg': {
    transform: isOpened ? undefined : 'rotate(180deg)',
  },
  '> svg path': {
    fill: !isOpened && hasError ? palette.error.toString() : undefined,
  },
  ...caretStyle,
}));

interface MenuProps {
  readonly menuStyle?: CSSObject;
  readonly height?: CSSObject['height'];
}

export const Menu = styled.ul.attrs({
  'data-testid': 'dropdown-menu',
})<MenuProps>({
  position: 'absolute',
  zIndex: -1,
  boxSizing: 'border-box',
  top: '100%',
  width: '100%',
  marginTop: `${-borderWidth}px`,

  borderRadius: '0 0 6px 6px',
  borderTop: 0,
  '> div > div:first-of-type': {
    '> div:last-of-type li': {
      borderBottom: 0,
    },
  },

  overflow: 'auto',
}, ({ menuStyle, height }) => menuStyle !== undefined ? {
  ...menuStyle,
  '&&&': menuStyle,
  height,
} : { height });

const ItemCSS: CSSObject = {
  display: 'block',

  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
  paddingLeft: '10px',

  fontWeight: 300,

  textAlign: 'left',
  backgroundColor: palette.white.toString(),

  cursor: 'pointer',
};
const ItemLabel = styled.li.attrs({
  'data-testid': 'dropdown-item-label',
})<ItemProps>({
  ...ItemCSS,

  fontWeight: 500,

  pointerEvents: 'none',
});

interface ItemProps {
  readonly itemStyle?: CSSObject;
  readonly isDisabled?: boolean;
}
const Item = styled.li.attrs({
  'data-testid': 'dropdown-item',
})<ItemProps & { hasRightText: boolean }>(({ isDisabled, hasRightText }) => ({
  display: 'flex',
  alignItems: 'center',

  boxSizing: 'border-box',
  width: '100%',
  height: 'auto',
  paddingLeft: '10px',
  paddingRight: '10px',

  textAlign: 'left',
  backgroundColor: palette.ContentsList.itemBackgroundGray.toString(),

  cursor: 'pointer',
  lineHeight: `${DEFAULT_DROPDOWN_ITEM_HEIGHT}px`,
  ':hover': {
    backgroundColor: !isDisabled ? palette.dropdown.dropdownHoverColor.toString() : undefined,
    cursor: !isDisabled ? 'pointer' : 'default',
  },

  justifyContent: hasRightText ? 'space-between' : 'left',
  borderBottom: `1px solid ${palette.dropdown.dividerColor.toString()}`,

  '> span': {
    ':first-of-type': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      marginRight: hasRightText ? '5px' : undefined,
    },
    ':nth-of-type(2)': {
      color: 'red',
    },
    whiteSpace: 'nowrap',
  },
}), ({ itemStyle }) => itemStyle !== undefined ? {
  ...itemStyle,
  '&&&': itemStyle,
} : {});

const itemLabelValue: string = '[]';

interface OptionItem {
  option: Option;
  itemStyle?: Props['itemStyle'];
  onClick(e: ReactMouseEvent<HTMLLIElement>): void;
  onMouseEnter(e: ReactMouseEvent<HTMLLIElement>): void;
}

const OptionItem: FC<OptionItem> = ({ option, itemStyle, onClick, onMouseEnter }) => {
  if (option.value === itemLabelValue) {
    return (
      <ItemLabel>
        <p>{option.leftText}</p>
      </ItemLabel>
    );
  } else {
    const isDisabled: boolean = Boolean(option.isDisabled);
    const hasRightText: boolean = option.rightText !== undefined;

    const rightText: ReactNode = useMemo(() => hasRightText ? (
      <span>
        {option.rightText}
      </span>
    ) : undefined, [option.rightText]);

    const item: ReactNode = (
      <Item
        itemStyle={itemStyle}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        isDisabled={isDisabled}
        hasRightText={hasRightText}
      >
        <span>
          {option.leftText}
        </span>
        {rightText}
      </Item>
    );

    if (option.tutorial === undefined) return <>{item}</>;

    return (
      <TutorialWrapperHoverable {...option.tutorial} >
        {item}
      </TutorialWrapperHoverable>
    );
  }
};

export interface StyleProps extends
  RootProps,
  WrapperProps,
  MainButtonProps,
  CaretProps,
  MenuProps,
  ItemProps,
  VerticalThumbProps,
  VerticalTrackProps,
  ValueEditiorProps,
  SearchIconProps {}


export interface Props extends StyleProps {
  readonly value: number | string | null | undefined;
  readonly isOpened?: boolean;
  readonly options: Array<Option>;
  readonly placeHolder: string;
  readonly className?: string;
  readonly hasError?: boolean;
  readonly isSearchEnabled?: boolean;
  readonly menuItemHeight?: string;
  readonly caretSVG?: ReactNode;
  readonly isDisabled?: boolean;
  onClick(option: Option, index: number): void;
  onDropdownItemMouseEnter?(option: Option, index: number): void;
  onDropdownMouseLeave?(): void;
  setIsDropdownOpen?(isOpened: boolean): void;
}

export interface State {
  readonly isOpened: boolean;
  readonly keyword: string;
  readonly filteredOptions: Array<Option>;
}

/**
 * Dropdown element
 */
class Dropdown extends Component<Props, State> {
  private readonly rootRef: RefObject<HTMLDivElement>;
  public constructor(props: Props) {
    super(props);
    this.rootRef = createRef();

    this.state = {
      isOpened: Boolean(this.props.isOpened),
      keyword: '',
      filteredOptions: props.options,
    };
  }

  // Register callback for outside click for closing dropdown
  public componentDidMount(): void {
    document.addEventListener('click', this.handleDocumentClick, false);
    document.addEventListener('touchend', this.handleDocumentClick, false);
  }

  // UnRegister callback for outside click for closing dropdown
  public componentWillUnmount(): void {
    document.removeEventListener('click', this.handleDocumentClick, false);
    document.removeEventListener('touchend', this.handleDocumentClick, false);
  }

  public componentDidUpdate({ options: prevOptions }: Readonly<Props>, { isOpened: prevIsOpened }: Readonly<State>): void {
    const { options }: Props = this.props;
    const { isOpened }: State = this.state;
    if (!_.isEqual(prevOptions, options)) {
      this.setState({ filteredOptions: options });
    }

    if (isOpened !== prevIsOpened) {
      this.props?.setIsDropdownOpen?.(Boolean(isOpened));
    }
  }

  @autobind
  private optionToElement(option: Option, index: number): ReactNode {
    const isDisabled: boolean | undefined = option.isDisabled;
    const onClick: (event: SyntheticEvent) => void = (event) => {
      if (!isDisabled) this.handleItemClick(event, option, index);
    };

    const onMouseEnter: (event: SyntheticEvent) => void = () => {
      if (!isDisabled) this.props.onDropdownItemMouseEnter?.(option, index);
      if (isDisabled) this.props.onDropdownMouseLeave?.();
    };

    return (
      <Fragment key={index}>
        <OptionItem
          option={option}
          itemStyle={this.props.itemStyle}
          onMouseEnter={onMouseEnter}
          onClick={onClick}
        />
      </Fragment>
    );
  }

  @autobind
  private handleDocumentClick({ target }: MouseEvent): void {
    const rootRef: HTMLDivElement | null = this.rootRef.current;

    if (
      rootRef !== null &&
      !rootRef.contains(target as Node) &&
      this.state.isOpened
    ) {
      this.setState({ isOpened: false });
    }
  }

  @autobind
  private handleButtonClick(e: ReactMouseEvent): void {
    if (this.props.isDisabled) return;
    if (this.state.isOpened && this.state.keyword.length > 0 && e.nativeEvent.detail === 0) {
      return;
    }
    this.setState((state) => ({
      isOpened: !state.isOpened,
    }));
  }

  @autobind
  private handleSearchChange(event: SyntheticEvent<HTMLInputElement>): void {
    const keyword: string = _.toLower(event.currentTarget.value.trim());

    /**
     * @info dirty trick to solve the AutoFill problem from Browsers
     */
    const matches: RegExpMatchArray | null = keyword.match(/[a-zA-Z\s]+/ig);
    if (keyword.length > 0 && matches && matches.length > 1) {
      return;
    }

    const hasKeyword: (option: Option) => boolean = ({ leftText: text, value }) =>
      _.toLower(text).indexOf(keyword) > -1 || _.toLower(value.toString()).indexOf(keyword) > -1;
    const filteredOptions: Array<Option> = keyword.length === 0 ?
      this.props.options :
      this.props.options.filter(hasKeyword);
    this.setState({
      keyword: event.currentTarget.value,
      filteredOptions,
    });
  }

  @autobind
  private handleItemClick(event: SyntheticEvent, option: Option, index: number): void {
    this.setState({
      isOpened: false,
    });
    this.props.onClick(option, index);

    /**
     * @desc this preventDefault help the Dropdown react correctly when put it inside of a Label
     */
    event.preventDefault();
  }

  public render(): ReactNode {
    const { keyword, filteredOptions, isOpened }: State = this.state;
    const { options, isSearchEnabled, height, menuItemHeight }: Props = this.props;

    const itemHeight: number = menuItemHeight ? parseInt(menuItemHeight, 10) : DEFAULT_DROPDOWN_ITEM_HEIGHT;
    const totalItemHeight: number = itemHeight * options.length;

    const menuHeight: number = parseInt(String(height), 10) > totalItemHeight ?
      totalItemHeight : parseInt(String(height), 10);

    const selectedOption: Option | undefined =
      options.find(({ value }) => value === this.props.value);
    const selectedValue: string =
      selectedOption === undefined ?
        this.props.placeHolder :
        selectedOption.leftText;

    const verticalTrackElement: (props: any) => ReactElement = (props) =>
      <VerticalTrack verticalTrackStyle={this.props.verticalTrackStyle} {...props} />;
    const verticalThumbElement: (props: any) => ReactElement = (props) =>
      <VerticalThumb verticalThumbStyle={this.props.verticalThumbStyle} {...props} />;

    const filteredItems: Array<ReactNode> = filteredOptions.map(this.optionToElement);
    const menuItem: ReactNode = height && height !== 'auto' ? (
      <Scrollbars
        renderTrackVertical={verticalTrackElement}
        renderThumbVertical={verticalThumbElement}
      >
        {filteredItems}
      </Scrollbars>
    ) : (
      <>
        {filteredItems}
      </>
    );

    const filteredItemsLength: number = filteredOptions.length * itemHeight;
    const menu: ReactNode = (
      isOpened ? (
        <Menu
          menuStyle={this.props.menuStyle}
          height={keyword !== '' && filteredItemsLength < menuHeight ? filteredOptions.length * itemHeight : menuHeight}
          onMouseLeave={this.props.onDropdownMouseLeave}
        >
          {menuItem}
        </Menu >
      ) : undefined
    );
    const caret: ReactNode = (
      <CaretWrapper
        isOpened={isOpened}
        hasError={this.props.hasError}
        caretStyle={this.props.caretStyle}
        data-testid='dropdown-caret'
      >
        {this.props.caretSVG ? this.props.caretSVG : <CaretSvg />}
      </CaretWrapper>
    );
    const searchIcon: ReactNode =
      isOpened && isSearchEnabled && (selectedOption === undefined || isOpened) ? (
        <SearchIconWrapper searchIconStyle={this.props.searchIconStyle}>
          <SearchSvg />
        </SearchIconWrapper>
      ) : undefined;
    const valueViewer: ReactNode = isOpened && isSearchEnabled ? (
      <ValueEditor
        value={keyword}
        valueEditorStyle={this.props.valueEditorStyle}
        autoFocus={true}
        onChange={this.handleSearchChange}
        data-testid='dropdown-value-input'
      />
    ) : (
      <ValueWrapper data-testid='dropdown-value'>{selectedValue}</ValueWrapper>
    );

    return (
      <Root
        rootStyle={this.props.rootStyle}
        className={this.props.className}
        ref={this.rootRef}
      >
        <Wrapper
          hasError={this.props.hasError}
          zIndex={this.props.zIndex ? this.props.zIndex + (isOpened ? 1 : 0) : Number(isOpened)}
          fontSize={this.props.fontSize}
          isOpened={isOpened}
          isDisabled={this.props.isDisabled}
        >
          <MainButton
            mainButtonStyle={this.props.mainButtonStyle}
            hasError={this.props.hasError}
            onClick={this.handleButtonClick}
            type='button'
            data-testid='dropdown-mainbutton'
            isOpened={isOpened}
            isDisabled={this.props.isDisabled}
          >
            {searchIcon}
            {valueViewer}
            {caret}
          </MainButton>
          {menu}
        </Wrapper>
      </Root>
    );
  }
}

export default Dropdown;
