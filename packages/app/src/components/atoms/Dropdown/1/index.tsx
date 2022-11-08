import Color from 'color';
import { autobind } from 'core-decorators';
import _ from 'lodash-es';
import React, { Component, Fragment, ReactNode, RefObject, SyntheticEvent, createRef, MouseEvent as ReactMouseEvent } from 'react';
import styled, { CSSObject } from 'styled-components';

import palette from '^/constants/palette';
import FaIcon from '^/components/atoms/FaIcon';

export interface Option {
  text: string;
  value: number | string;
}

export const createOption: (text: string) => Option = (
  text,
) => ({
  text,
  value: text,
});

export const createOptions: (texts: Array<string>) => Array<Option> = (
  texts,
) => texts.map(createOption);

const borderWidth: number = 1;

const Root = styled.div({
  flexShrink: 0,
  width: '110px',
  height: '40px',
});

interface WrapperProps {
  readonly zIndex: number;
}
const Wrapper = styled.div<WrapperProps>(({ zIndex }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',

  color: palette.textLight.toString(),

  '& *': {
    lineHeight: '39px',

    ':not(.fa)': {
      fontSize: '13px',
      color: 'inherit',
    },
  },

  zIndex,
}));

interface MainButtonProps {
  readonly mainButtonStyle?: CSSObject;
  readonly error?: boolean;
}
const MainButton = styled.button<MainButtonProps>({
  display: 'flex',
  justifyContent: 'space-between',

  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
  paddingLeft: '1px',
  paddingRight: '1px',

  borderWidth: `${borderWidth}px`,
  borderStyle: 'solid',
  borderColor: palette.border.toString(),
  borderRadius: '3px',

  backgroundColor: palette.white.toString(),

  textAlign: 'left',
  cursor: 'pointer',
}, ({ error, mainButtonStyle }) => {
  const buttonStyle: CSSObject = mainButtonStyle !== undefined ? {
    ...mainButtonStyle,
    '&&&': mainButtonStyle,
  } : {};

  return {
    ...buttonStyle,
    borderColor: (error ? palette.error : palette.border).toString(),
  };
});

const SearchIconWrapper = styled.span({
  marginLeft: '10px',
});

const ValueWrapper = styled.span({
  marginLeft: '9px',
  flexGrow: 1,
  textTransform: 'capitalize',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  pointerEvents: 'none',

  lineHeight: '39px',
});

const ValueEditor = styled.input({
  marginLeft: '9px',
  flexGrow: 1,

  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  backgroundColor: 'transparent',
});

interface CaretProps {
  readonly caretStyle?: CSSObject;
}

const Caret = styled.i.attrs({
  className: 'fa fa-caret-down',
})<CaretProps>({
  marginRight: '9px',

  fontSize: '10px',
  color: `${Color('black').toString()}`,
}, ({ caretStyle }) => caretStyle !== undefined ? {
  ...caretStyle,
  '&&&': caretStyle,
} : {});

interface MenuProps {
  readonly menuStyle?: CSSObject;
  readonly height?: CSSObject['height'];
}
export const Menu = styled.ul.attrs({
  'data-testid': 'dropdown-menu',
})<MenuProps>({
  position: 'absolute',

  boxSizing: 'border-box',
  top: '100%',
  width: '100%',
  maxHeight: '300px',
  marginTop: `${-borderWidth}px`,

  borderWidth: `${borderWidth}px`,
  borderStyle: 'solid',
  borderColor: palette.border.toString(),
  borderRadius: '0 0 3px 3px',
  borderTop: 0,

  backgroundColor: palette.white.toString(),

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
}

const Item = styled.li.attrs({
  'data-testid': 'dropdown-item',
})<ItemProps>({
  display: 'block',
  textTransform: 'capitalize',
  boxSizing: 'border-box',
  width: '100%',
  height: 'auto',
  paddingLeft: '10px',

  textAlign: 'left',
  backgroundColor: palette.white.toString(),

  cursor: 'pointer',
  lineHeight: '26px',
  ':hover': {
    color: 'var(--color-theme-primary-lightest)',
  },
}, ({ itemStyle }) => itemStyle !== undefined ? {
  ...itemStyle,
  '&&&': itemStyle,
} : {});

const HR = styled.hr({
  height: 0,
});


const itemLabelValue: string = '[]';

interface StyleProps extends WrapperProps, MainButtonProps, CaretProps, MenuProps, ItemProps {}
export interface Props extends StyleProps {
  readonly value: number | string | null | undefined;
  readonly options: Array<Option>;
  readonly placeHolder: string;
  readonly className?: string;
  readonly error?: boolean;
  readonly isSearchEnable?: boolean;
  readonly trackAction?: string;
  readonly trackLabel?: string;
  onClick(option: Option, index: number): void;
}

export interface State {
  readonly isOpen: boolean;
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
      isOpen: false,
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

  public componentDidUpdate({ options: prevOptions }: Readonly<Props>): void {
    const { options }: Props = this.props;
    if (!_.isEqual(prevOptions, options)) {
      this.setState({ filteredOptions: options });
    }
  }

  @autobind
  private optionToElement(option: Option, index: number): ReactNode {
    const onClick: (event: SyntheticEvent) => void =
      (event) => this.handleItemClick(event, option, index);

    const item: ReactNode = option.value === itemLabelValue ? (
      <ItemLabel>{option.text}</ItemLabel>
    ) : (
      <Item
        className={option.value === this.props.value ? 'active' : undefined}
        itemStyle={this.props.itemStyle}
        onClick={onClick}
      >
        {option.text}
      </Item>
    );

    return (
      <Fragment key={index}>
        <HR />
        {item}
      </Fragment>
    );
  }

  @autobind
  private handleDocumentClick({ target }: MouseEvent): void {
    const rootRef: HTMLDivElement | null = this.rootRef.current;

    if (
      rootRef !== null &&
      !rootRef.contains(target as Node) &&
      this.state.isOpen
    ) {
      this.setState({ isOpen: false });
    }
  }

  @autobind
  private handleButtonClick(e: ReactMouseEvent): void {
    if (this.state.isOpen && this.state.keyword.length > 0 && e.nativeEvent.detail === 0) {
      return;
    }
    this.setState((state) => ({
      isOpen: !state.isOpen,
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

    const hasKeyword: (option: Option) => boolean = ({ text, value }) =>
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
      isOpen: false,
    });
    this.props.onClick(option, index);

    /**
     * @desc this preventDefault help the Dropdown react correctly when put it inside of a Label
     */
    event.preventDefault();
  }

  public render(): ReactNode {
    const { keyword, filteredOptions, isOpen }: State = this.state;
    const { options, isSearchEnable }: Props = this.props;

    const selectedOption: Option | undefined =
      options.find(({ value }) => value === this.props.value);
    const selectedValue: string =
      selectedOption === undefined ?
        this.props.placeHolder :
        selectedOption.text;

    const menu: ReactNode = (
      isOpen ? (
        <Menu menuStyle={this.props.menuStyle} height={this.props.height}>
          {filteredOptions.map(this.optionToElement)}
        </Menu>
      ) : undefined
    );

    const searchIcon: ReactNode = isSearchEnable && (selectedOption === undefined || isOpen) ? (
      <SearchIconWrapper>
        <FaIcon faNames='search' fontSize='15px' data-testid='dropdown-search-icon' />
      </SearchIconWrapper>
    ) : undefined;

    const valueViewer: ReactNode = isOpen && isSearchEnable ? (
      <ValueEditor
        value={keyword}
        autoFocus={true}
        onChange={this.handleSearchChange}
        data-testid='dropdown-value-input'
      />
    ) : (
      <ValueWrapper data-testid='dropdown-value'>{selectedValue}</ValueWrapper>
    );

    return (
      <Root
        className={this.props.className}
        ref={this.rootRef}
        data-ddm-track-action={this.props.trackAction}
        data-ddm-track-label={this.props.trackLabel}
      >
        <Wrapper zIndex={this.props.zIndex + (isOpen ? 1 : 0)}>
          <MainButton
            mainButtonStyle={this.props.mainButtonStyle}
            error={this.props.error}
            onClick={this.handleButtonClick}
            type='button'
            data-testid='dropdown-mainbutton'
          >
            {searchIcon}
            {valueViewer}
            <Caret caretStyle={this.props.caretStyle} data-testid='dropdown-caret' />
          </MainButton>
          {menu}
        </Wrapper>
      </Root>
    );
  }
}
export default Dropdown;
