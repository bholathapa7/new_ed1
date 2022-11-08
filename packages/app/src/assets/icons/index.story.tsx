import { StoryApi } from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import React, { ReactNode, ComponentType } from 'react';
import styled from 'styled-components';

import ContentsSidebarHeaderSVG1 from '^/assets/icons/annotation/arrow.svg';
import ProjectSidebarPNG from '^/assets/icons/arrow.png';
import MeasurementPickerSVG from '^/assets/icons/arrow.svg';
import ContentImagePopupSVG1 from '^/assets/icons/back-arrow.svg';
import ContentImagePopupSVG2 from '^/assets/icons/back-small-arrow.svg';
import ContentsSidebarHeaderSVG2 from '^/assets/icons/content-sidebar-header/arrow.svg';
import ContentsListSVG from '^/assets/icons/contents-list/arrow.svg';
import ContentsListDisabledSVG from '^/assets/icons/contents-list/disabled-arrow.svg';
import DateScreenSVG from '^/assets/icons/date-screen/arrow.svg';
import CalendarDropdownSVG from '^/assets/icons/dropdown/dropdown-caret-arrow.svg';
import LeftBoldArrowSVG from '^/assets/icons/left-bold-arrow.svg';
import PopupLeftSVG from '^/assets/icons/popup/left-arrow.svg';
import TutorialSVG from '^/assets/icons/tutorial/detail-arrow.svg';
import UploadPopupSVG from '^/assets/icons/upload-popup/right-angle.svg';


const Root = styled.div({
  width: '100%',

  display: 'flex',
  flexFlow: 'wrap',
});

const Divider = styled.div({
  padding: '30px',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  '> span': {
    marginTop: '10px',
  },
});


const story: StoryApi = storiesOf('Icons|Arrow', module);

const pngs: { [K in string]: string } = { ProjectSidebarPNG };
const svgs: { [K in string]: ComponentType<any> } = {
  MeasurementPickerSVG, ContentsSidebarHeaderSVG1, ContentsSidebarHeaderSVG2, DateScreenSVG, UploadPopupSVG, ContentsListSVG,
  ContentsListDisabledSVG, ContentImagePopupSVG1, ContentImagePopupSVG2, CalendarDropdownSVG, TutorialSVG, PopupLeftSVG, LeftBoldArrowSVG,
};

const pngElements: ReactNode = Object.keys(pngs).map((png, index) => (
  <Divider key={index}>
    <img src={pngs[png]} alt={png} />
    {png}
  </Divider>
));

const svgElements: ReactNode = Object.keys(svgs).map((svg, index) => {
  const SVG: ComponentType<any> = svgs[svg];

  return (
    <Divider key={index}>
      <SVG />
      {svg}
    </Divider>
  );
});

story.add('default', () => (
  <Root>
    {pngElements}
    {svgElements}
  </Root>
));
