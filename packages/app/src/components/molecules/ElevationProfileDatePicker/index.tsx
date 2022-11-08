/* eslint-disable max-lines */
import Color from 'color';
import React, { FC, ReactNode, useRef, useState, MouseEvent, MutableRefObject } from 'react';
import { useSelector } from 'react-redux';
import styled, { CSSObject } from 'styled-components';

import AddSvg from '^/assets/icons/elevation-profile/add.svg';
import ArrowGraySvg from '^/assets/icons/elevation-profile/arrow-gray.svg';
import CloseThinSvg from '^/assets/icons/elevation-profile/close-thinner.svg';
import { Props as CalendarProps } from '^/components/atoms/Calendar';
import Dropdown, { Option } from '^/components/atoms/Dropdown';
import WrapperHoverable, { Props as WrapperHoverableProps } from '^/components/atoms/WrapperHoverable';
import { ScreenPicker } from '^/components/organisms/ScreenPicker';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { FontFamily, wrapperHoverableDefaultStyle } from '^/constants/styles';
import { UseL10n, UseState, typeGuardDesignDXFs, useClickOutside, useGetAllContentsOf, useL10n } from '^/hooks';
import * as T from '^/types';
import Text from './text';

const Input = styled.div<{
  hasError?: boolean; isCalendarClicked: boolean;
}>(({ hasError, isCalendarClicked }) => ({
  position: 'relative',
  boxSizing: 'border-box',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  maxWidth: '200px',
  width: '10vw',
  height: '35px',

  marginLeft: '7px',

  borderRadius: '5px',
  // eslint-disable-next-line no-magic-numbers
  backgroundColor: (hasError ? palette.UploadPopup.error.alpha(0.05) : palette.white).string(),

  cursor: 'pointer',

  '> p': {
    color: hasError ? palette.UploadPopup.error.toString() : undefined,
  },

  '> svg path': {
    fill: hasError ? palette.UploadPopup.error.toString() : isCalendarClicked ? 'var(--color-theme-primary)' : undefined,
  },
}));

const AddComparisonOptionWrapper = styled.div({
  width: '100%',
  minHeight: '70px',
  borderRadius: '5px',
  backgroundColor: palette.white.toString(),
  boxShadow: '0 1px 8px 0 rgba(0, 0, 0, 0.2), 0 3px 4px 0 rgba(0, 0, 0, 0.18), 0 3px 3px 0 rgba(0, 0, 0, 0.16)',
  position: 'absolute',
  right: 0,
  top: '40px',
  zIndex: 500,
});

const AddComparisonOption = styled.button<{isDisabled: boolean}>(({ isDisabled }) => ({
  width: '100%',
  minHeight: '34px',
  overflow: 'hidden',

  paddingTop: '2px',
  paddingLeft: '12px',
  paddingRight: '24px',

  textAlign: 'left',
  textOverflow: 'ellipsis',

  backgroundColor: palette.white.toString(),

  fontSize: '11px',
  color: isDisabled ? palette.gray.toString() : palette.textGray.toString(),

  cursor: isDisabled ? 'not-allowed' : 'pointer',

  ':hover': { backgroundColor: isDisabled ? undefined : palette.dropdown.dropdownHoverColor.toString() },

  ':first-child': { borderTopLeftRadius: '5px', borderTopRightRadius: '5px' },
  ':last-child': { borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px' },
}));

const AddComparisonArrow2 = styled.div({
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 500,
  right: '12px',
  top: '50px',
});

const AddComparisonArrow = styled.div({
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 500,
  right: '12px',
  top: '86px',
});

const Divider = styled.div({
  height: '1px',
  backgroundColor: palette.borderLight.toString(),
});

const ColorBar = styled.p<{customColor?: Color}>(({ customColor }) => ({
  backgroundColor: customColor ? customColor.toString() : undefined,
  width: '10px',
  height: '3px',

  marginLeft: '10px',
  marginRight: '10px',
}));

const InputContent = styled.p({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContents: 'space-between',

  width: '100%',
  color: dsPalette.title.toString(),

  fontSize: '11px',

  letterSpacing: '-0.2px',
});

const ComparisonTitleWrapper = styled.p({
  width: '100%',
  '> span:nth-child(1)' : {
    fontFamily: FontFamily.ROBOTO,
    fontWeight: 600,
  },
  '> span:nth-child(2)' : {
    fontFamily: FontFamily.NOTOSANS,
    fontWeight: 400,
  },
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: 3,
  whiteSpace: 'nowrap',
});

const DeleteComparisonButton = styled.span({
  marginRight: '12px',

  borderRadius: '4px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  ':hover' : {
    backgroundColor: palette.ContentsList.itemBackgroundGray.toString(),
  },

  padding: '6px',
});

const Placeholder = styled.p({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'cneter',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: '11px',
  color: dsPalette.title.toString(),
});

const AddComparisonButton = styled.span({
  paddingLeft: '0px',
  marginRight: '6px',
});

const CalendarWrapper = styled.div({
  position: 'absolute',
  top: '114%' ,
  width: '200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',

  // eslint-disable-next-line no-magic-numbers
  backgroundColor: palette.white.alpha(0.76).toString(),
  backdropFilter: 'blur(30px)',
  boxShadow: '0 1px 8px 0 #00000033, 0 3px 4px 0 #0000002e, 0 3px 3px 0 #00000028',
  borderRadius: '6px',

  cursor: 'initial',

  overflow: 'hidden',
});

const DropdownWrapper = styled.span({
  position: 'absolute',
  right: '-6px',
  top: '40px',

  maxWidth: '167px',
  width: '9vw',

  zIndex: 500,
  marginLeft: '50px',
  marginRight: '6px',
});

const dropdownSearchIconStyle: CSSObject = {
  marginLeft: '0px',

  paddingLeft: '4px',
  paddingTop: '4px',
};

const dropdownMainButtonStyle: CSSObject = {
  maxWidth: '167px',
  width: '9vw',
  color: palette.textBlack.toString(),
  backgroundColor: palette.white.toString(),
  fontWeight: 500,
  height: '35px',
  padding: '7px',

  borderBottom: `0.7px solid ${palette.dropdown.dividerColor.toString()}`,

  boxShadow: '0 1px 8px 0 #00000033',
};

const dropdownItemStyle: CSSObject = {
  color: palette.textBlack.toString(),

  height: '26px',

  justifyContent: 'flex-start',
  paddingLeft: '28px',

  whiteSpace: 'nowrap',
  overflow: 'hidden',
  backgroundColor: palette.white.toString(),
  ':hover': {
    backgroundColor: palette.dropdown.dropdownHoverColor.toString(),
  },
};

const dropdownMenuStyle: CSSObject = {
  maxWidth: '167px',
  maxHeight: '128px',
  top: '110%',
  width: '9vw',
  boxShadow: '0 4px 8px 0 #00000033, 0 3px 4px 0 #0000002e, 0 3px 3px 0 #00000028',
};

const valueEditorStyle: CSSObject = {
  paddingTop: '1px',
  fontSize: '11px',
};

const TooltipBalloonStyle: CSSObject = {
  top: '50%',
  left: '50%',
  bottom: 'unset',
  transform: 'translate(-50%, 50%)',
};

const TooltipCustomStyle: WrapperHoverableProps['customStyle'] = {
  tooltipBalloonStyle: TooltipBalloonStyle,
  tooltipWrapperStyle: {
    position: 'relative',
    width: 'calc(100% - 25px)',
  },
  tooltipTargetStyle: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
};

interface InputTextProps {
  readonly title?: string;
  readonly isDesignDXF?: boolean;
}

const InputText: FC<InputTextProps> = ({
  title, isDesignDXF,
}) => {
  if (isDesignDXF || title === undefined) return <>{title}</>;

  const dateWithSpace: string[] | null = title.match(/^\d{2}.(0[1-9]|1[012]).(0[1-9]|[12][0-9]|3[01])\s/g);
  if (dateWithSpace === null) return <>{title}</>;

  const screenTitle: string = title.replace(dateWithSpace[0], '');

  return (
    <>
      <span >{dateWithSpace[0]}</span>
      <span >{screenTitle}</span>
    </>
  );
};

const disabledStyle: WrapperHoverableProps['customStyle'] = {
  ...wrapperHoverableDefaultStyle,
  tooltipBalloonStyle: {
    ...wrapperHoverableDefaultStyle.tooltipBalloonStyle,
    transform: 'translate(166px, -34px)',
  },
};

export interface Props {
  readonly hasError?: boolean;
  readonly isDesignDXF?: boolean;
  readonly title?: string;
  readonly color?: Color;
  readonly pickableScreens?: T.Screen[];
  readonly idx?: number;
  readonly calendarType: CalendarProps['calendarType'];
  readonly defaultDate?: CalendarProps['defaultDate'];
  readonly enabledDates?: CalendarProps['enabledDates'];
  readonly disabledDates?: CalendarProps['disabledDates'];
  readonly customCalendarPosition?: string;
  deleteComparison(idx: number): void;
  addComparison(input: T.Screen['id'] | T.DSMContent['title']): void;
}

export const ElevationProfileDatePicker: FC<Props> = ({
  hasError, isDesignDXF, title, color, idx, pickableScreens, addComparison, deleteComparison,
}) => {
  const [l10n]: UseL10n = useL10n();
  const { ProjectConfigPerUser }: T.State = useSelector((state: T.State) => state);

  const calendarRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const [isCalendarClicked, setCalendarClicked]: UseState<boolean> = useState<boolean>(false);
  const [isAddComparisonClicked, setAddComparisonClicked]: UseState<boolean> = useState<boolean>(false);
  const [isDSMOptionClicked, setDSMOptionClicked]: UseState<boolean> = useState<boolean>(false);
  const [isDesignOptionClicked, setDesignOptionClicked]: UseState<boolean> = useState<boolean>(false);

  const isNewComparison: boolean = title === undefined;

  const designDXFs: Array<T.DesignDXFContent> = typeGuardDesignDXFs(useGetAllContentsOf(T.ContentsQueryParam.TYPE)(T.ContentType.DESIGN_DXF));

  useClickOutside({ ref: calendarRef, callback: () => {
    if (isAddComparisonClicked) setAddComparisonClicked(false);
    if (isCalendarClicked) setCalendarClicked(false);
    if (isDSMOptionClicked) setDSMOptionClicked(false);
    if (isDesignOptionClicked) setDesignOptionClicked(false);
  } });

  const handleInputClick: (e: MouseEvent<HTMLDivElement>) => void = () => {
    if (!isNewComparison) return;
    if (isCalendarClicked) setCalendarClicked(false);
    if (isDSMOptionClicked) setDSMOptionClicked(false);
    if (isDesignOptionClicked) setDesignOptionClicked(false);
    setAddComparisonClicked(!isAddComparisonClicked);
  };

  const handleCalendarClick: (e: MouseEvent<HTMLDivElement>) => void = (e) => {
    e.stopPropagation();
    setCalendarClicked(isCalendarClicked);
  };

  const handleScreenClick: (selectedScreen: T.Screen) => void = (selectedScreen) => {
    addComparison(selectedScreen.id);
    setDSMOptionClicked(false);
  };

  const handleDropdownClick: (option: Option) => void = (option) => {
    if (isAddComparisonClicked) setAddComparisonClicked(false);
    addComparison(option.value);
    setDesignOptionClicked(!isDesignOptionClicked);
  };

  const handleDropdownWrapperClick: (e: MouseEvent<HTMLDivElement>) => void = (e) => {
    e.stopPropagation();
    if (isAddComparisonClicked) setAddComparisonClicked(false);
  };

  const handleDSMComparisonClick: () => void = () => {
    if (isAddComparisonClicked) setAddComparisonClicked(false);
    setDSMOptionClicked(!isDSMOptionClicked);
  };
  const handleDesignComparisonClick: () => void = () => {
    if (isAddComparisonClicked) setAddComparisonClicked(false);
    setDesignOptionClicked(!isDesignOptionClicked);
  };

  const handleDeleteComparisonClick: () => void = () => {
    if (idx === undefined) throw new Error('Failed to delete: no idx found for comparisons');
    deleteComparison(idx);
  };

  const deleteButton: ReactNode = idx !== 0 ? (
    <DeleteComparisonButton onClick={handleDeleteComparisonClick}>
      <CloseThinSvg />
    </DeleteComparisonButton>
  ) : undefined;

  const inputContent: ReactNode = title ? (
    <>
      <InputContent>
        <WrapperHoverable
          title={title}
          customStyle={TooltipCustomStyle}
        >
          <ColorBar customColor={color} />
          <ComparisonTitleWrapper>
            <InputText title={title} isDesignDXF={isDesignDXF} />
          </ComparisonTitleWrapper>
        </WrapperHoverable>
        {deleteButton}
      </InputContent>
    </>
  ) : (
    <Placeholder>
      <AddComparisonButton>
        <AddSvg />
      </AddComparisonButton>
      {l10n(Text.addComparison)}
    </Placeholder>
  );

  const calendar: ReactNode = isDSMOptionClicked ? (
    <CalendarWrapper onClick={handleCalendarClick}>
      <ScreenPicker
        size={T.CalendarScreenSize.S}
        currentScreenId={ProjectConfigPerUser.config?.lastSelectedScreenId}
        onChange={handleScreenClick}
        pickableScreens={pickableScreens}
      />
    </CalendarWrapper>
  ) : undefined;

  const dropdown: ReactNode = isDesignOptionClicked ? (
    <DropdownWrapper onClick={handleDropdownWrapperClick}>
      <Dropdown
        mainButtonStyle={dropdownMainButtonStyle}
        itemStyle={dropdownItemStyle}
        menuStyle={dropdownMenuStyle}
        isSearchEnabled={designDXFs.length > 0}
        valueEditorStyle={valueEditorStyle}
        caretStyle={{ display: 'none' }}
        value={''}
        placeHolder={designDXFs.length > 0 ? '' : l10n(Text.DesignOptionDisabled)}
        options={designDXFs.map((dxf) => ({ leftText: dxf.title, value: dxf.id }))}
        menuItemHeight={'22px'}
        zIndex={1}
        searchIconStyle={dropdownSearchIconStyle}
        isOpened={designDXFs.length > 0}
        onClick={handleDropdownClick}
      />
    </DropdownWrapper>
  ) : undefined;

  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  const isAddDSMOptionDisabled: boolean = (pickableScreens || []).length === 0;
  const isAddDesignOptionDisabled: boolean = designDXFs.length === 0;

  const addDSMOption: ReactNode = isAddDSMOptionDisabled ? (
    <WrapperHoverable
      title={l10n(Text.DSMOptionDisabled)}
      customStyle={disabledStyle}
    >
      <AddComparisonOption isDisabled={true} >
        {l10n(Text.DSMOption)}
      </AddComparisonOption>
    </WrapperHoverable>
  ) : (
    <AddComparisonOption onClick={handleDSMComparisonClick} isDisabled={false}>
      {l10n(Text.DSMOption)}
    </AddComparisonOption>
  );

  const addDesignOption: ReactNode = isAddDesignOptionDisabled ? (
    <WrapperHoverable
      title={l10n(Text.DesignOptionDisabled)}
      customStyle={disabledStyle}
    >
      <AddComparisonOption isDisabled={true} >
        {l10n(Text.DesignOption)}
      </AddComparisonOption>
    </WrapperHoverable>
  ) : (
    <AddComparisonOption onClick={handleDesignComparisonClick} isDisabled={false}>
      {l10n(Text.DesignOption)}
    </AddComparisonOption>
  );

  const addComparisonDropdownOption: ReactNode = isAddComparisonClicked ? (
    <>
      <AddComparisonOptionWrapper >
        {addDSMOption}
        <Divider />
        {addDesignOption}
      </AddComparisonOptionWrapper >
      <AddComparisonArrow>
        <ArrowGraySvg />
      </AddComparisonArrow>
      <AddComparisonArrow2>
        <ArrowGraySvg />
      </AddComparisonArrow2>
    </>
  ) : undefined;

  return (
    <Input ref={calendarRef} hasError={hasError} isCalendarClicked={isCalendarClicked} onClick={handleInputClick}>
      {inputContent}
      {addComparisonDropdownOption}
      {calendar}
      {dropdown}
    </Input >
  );
};
