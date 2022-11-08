import { Props as WrapperHoverableProps } from '^/components/atoms/WrapperHoverable';

import * as T from '^/types';
import { CSSObject } from 'styled-components';

const mobileWidth: number = 766;
const mobileCssQuery: string = `@media(max-width: ${mobileWidth}px)`;
const isMobile: () => boolean = () => window.innerWidth <= mobileWidth;

/**
 * These are using fonts in our project
 */
export enum FontFamily {
  ROBOTO = 'Roboto',
  NOTOSANS = 'Noto Sans KR',
  NANUMBARUNGOTHIC = 'NanumBarunGothic'
}

export const DeviceWidth: { [K in T.Device]: number } = {
  [T.Device.MOBILE_S]: 360,
  [T.Device.MOBILE_L]: 576,
  [T.Device.TABLET]: 768,
  [T.Device.DESKTOP]: 769,
};

export const DeviceLandscapeHeight: { [T.Device.MOBILE_L]: number; [T.Device.TABLET]: number } = {
  [T.Device.MOBILE_L]: 414,
  [T.Device.TABLET]: 768,
};

export const MediaQuery: { [K in T.Device]: string } = {
  [T.Device.MOBILE_S]: `@media(max-width: ${DeviceWidth[T.Device.MOBILE_S]}px)`,
  [T.Device.MOBILE_L]: `@media(max-width: ${DeviceWidth[T.Device.MOBILE_L]}px)`,
  [T.Device.TABLET]: `@media(max-width: ${DeviceWidth[T.Device.TABLET]}px)`,
  [T.Device.DESKTOP]: `@media(min-width: ${DeviceWidth[T.Device.DESKTOP]}px)`,
};

export const MediaQueryLandscapeHeight: { [T.Device.MOBILE_L]: string; [T.Device.TABLET]: string } = {
  [T.Device.MOBILE_L]: `@media(max-height: ${DeviceLandscapeHeight[T.Device.MOBILE_L]}px)`,
  [T.Device.TABLET]: `@media(max-height: ${DeviceLandscapeHeight[T.Device.TABLET]}px)`,
};

type responsiveStyleKey = 'sideBar' | 'tabBar' | 'contentList' | 'topBar' | 'photoListItem';
type responsiveStyleByDevice = { [K in T.Device]?: CSSObject };
type responsiveStyle = { [K in responsiveStyleKey]: responsiveStyleByDevice };

export const responsiveStyle: responsiveStyle = {
  sideBar: {
    [T.Device.MOBILE_S]: { width: '328px' },
    [T.Device.MOBILE_L]: { width: '340px' },
    [T.Device.DESKTOP]: { width: '366px' },
  },
  tabBar: {
    [T.Device.DESKTOP]: { width: '60px' },
  },
  contentList: {
    [T.Device.MOBILE_S]: { width: '268px' },
    [T.Device.MOBILE_L]: { width: '281px' },
    [T.Device.DESKTOP]: { width: '360px' },
  },
  topBar: {
    [T.Device.DESKTOP]: { height: '50px' },
  },
  photoListItem: {
    [T.Device.MOBILE_L]: { height: '180px' },
    [T.Device.TABLET]: { height: '240px' },
    [T.Device.DESKTOP]: { height: '300px' },
  },
};


const styles = {
  /**
   * Instead of Mobile first, our design is Web first,
   * because of the nature of our platform is Web-oriented.
   */
  mobileMaxWidth: mobileWidth,
  mobileCssQuery,
  isMobile,
};

export const wrapperHoverableDefaultStyle: WrapperHoverableProps['customStyle'] = {
  tooltipWrapperStyle: { position: 'relative' },
  tooltipBackgroundStyle: {
    borderRadius: '6px',
  },
  tooltipArrowStyle: {
    left: '71%',
  },
  tooltipBalloonStyle: {
    width: '216px',
    transform: 'translate(-90%, 3px)',

    bottom: 'auto',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',

    padding: '14px 15px 9px 15px',
  },
  tooltipTextTitleStyle: {
    marginBottom: '4px',

    whiteSpace: 'normal',

    overflowWrap: 'break-word',

    lineHeight: '1.58',

    fontSize: '12px',
    fontWeight: 'normal',
  },
};

export const DISABLED_CONTENT_OPACITY: number = 0.3;

export default styles;
