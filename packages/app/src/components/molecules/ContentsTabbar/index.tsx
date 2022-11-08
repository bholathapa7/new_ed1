import Tippy from '@tippyjs/react';
import React, { FC, ReactElement, ReactNode } from 'react';
import styled, { CSSObject } from 'styled-components';

import ESSSVG from '^/assets/icons/contents-tab-bar/ess.svg';
import MapSVG from '^/assets/icons/contents-tab-bar/map.svg';
import MeasurementSVG from '^/assets/icons/contents-tab-bar/measurement.svg';
import OverlaySVG from '^/assets/icons/contents-tab-bar/overlay.svg';
import PhotoSVG from '^/assets/icons/contents-tab-bar/photo.svg';
import UploadSVG from '^/assets/icons/contents-tab-bar/upload.svg';

import AngelswingLogo from '^/assets/icons/logo.svg';
import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import palette from '^/constants/palette';
import * as T from '^/types';
import { isPhone } from '^/utilities/device';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';
import { l10n } from '^/utilities/l10n';
import { withErrorBoundary } from '^/utilities/withErrorBoundary';
import { CANCELLABLE_CLASS_NAME } from '../CreatingVolumeClickEventHandler';
import { Fallback } from './fallback';
import Text from './text';

const getSidebarTabsByFeature: (features: T.PermissionFeature) => T.ContentPageTabType[] = (features) => {
  const tabs: T.ContentPageTabType[] = [];

  tabs.push(T.ContentPageTabType.MAP);

  if (features.ddm) {
    tabs.push(
      T.ContentPageTabType.OVERLAY,
      T.ContentPageTabType.MEASUREMENT,
      T.ContentPageTabType.PHOTO,
      T.ContentPageTabType.ESS,
    );
  }

  return tabs;
};

interface DisableProps {
  isDisabled?: boolean;
}

interface SelectProps {
  isSelected?: boolean;
}

export const Root = styled.aside({
  position: 'relative',
  zIndex: 20,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',

  width: '100%',
  height: '100%',

  backgroundColor: palette.SideBar.background.toString(),
  boxShadow: '0 0 8px 0 rgba(0, 0, 0, 0.2)',
});

const CustomLogoImage = styled.img({
  maxWidth: '30px',
});

export const tabItemStyle: CSSObject = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
  margin: '8px',
  borderRadius: '5px',
};

export const LogoTab = styled.section<DisableProps>(({ isDisabled }) => ({
  ...tabItemStyle,

  width: '100%',
  height: '50px',
  borderRadius: 0,
  margin: 0,
  cursor: isDisabled ? 'default' : 'pointer',

  '&:hover': (() => {
    if (isDisabled) return undefined;

    return { backgroundColor: palette.SideBar.hoverBackground.toString() };
  })(),
}));

export const TabItem = styled.section<DisableProps & SelectProps>(({ isSelected, isDisabled }) => ({
  ...tabItemStyle,
  cursor: isDisabled ? 'default' : 'pointer',

  backgroundColor: isSelected ? 'var(--color-theme-primary)' : undefined,

  '> svg path': (() => {
    if (isSelected) return { fill: palette.white.toString() };
    if (isDisabled) return { fill: palette.iconDisabled.toString() };

    return undefined;
  })(),

  '&:hover': (() => {
    if (isDisabled || isSelected) return undefined;

    return { backgroundColor: palette.SideBar.hoverBackground.toString() };
  })(),
}));

export const UploadTab = styled(TabItem)(({ isSelected, isDisabled }) => ({
  width: '100%',
  height: '60px',

  margin: '0',

  borderRadius: '0',
  backgroundColor: palette.uploadIcon.toString(),

  '&:hover': (() => {
    if (isDisabled || isSelected) return undefined;

    return { backgroundColor: palette.hoverUploadIcon.toString() };
  })(),
}));


export const tabIconMap: Record<T.ContentPageTabType, ReactElement> = {
  [T.ContentPageTabType.MAP]: <MapSVG />,
  [T.ContentPageTabType.OVERLAY]: <OverlaySVG />,
  [T.ContentPageTabType.MEASUREMENT]: <MeasurementSVG />,
  [T.ContentPageTabType.PHOTO]: <PhotoSVG />,
  [T.ContentPageTabType.ESS]: <ESSSVG />,
};

/**
 * @desc Retrieving Tooltip text regarding to the Tab Type
 */
function tabToTooltip(tabType: T.ContentPageTabType, language: T.Language): string {
  /* istanbul ignore next */
  switch (tabType) {
    case T.ContentPageTabType.MAP:
      return l10n(Text.tooltipMap, language);
    case T.ContentPageTabType.OVERLAY:
      return l10n(Text.tooltipOverlay, language);
    case T.ContentPageTabType.MEASUREMENT:
      return l10n(Text.tooltipMeasurement, language);
    case T.ContentPageTabType.PHOTO:
      return l10n(Text.tooltipPhoto, language);
    case T.ContentPageTabType.ESS:
      return l10n(Text.tooltipESS, language);
    default:
      return exhaustiveCheck(tabType);
  }
}

export interface Props {
  readonly currentTab: T.ContentPageTabType;
  readonly role: T.PermissionRole;
  readonly printingContentId: T.ContentsPageState['printingContentId'];
  readonly squareLogoUrl?: T.PlanConfig['squareLogoUrl'];
  readonly has3DView: boolean;
  readonly userFeaturePermission: T.User['featurePermission'];
  readonly features: T.PermissionFeature;
  onTabClick(tab: T.ContentPageTabType): void;
  onUploadClick(role: T.PermissionRole): void;
  onLogoClick(): void;
  preventAutoSelect(): void;
}

/**
 * Component for sidebar tab of contents page
 */
const ContentsTabbar: FC<Props & L10nProps> = ({
  printingContentId, features, has3DView, squareLogoUrl, language, currentTab, role,
  onTabClick, preventAutoSelect, onUploadClick, onLogoClick,
}) => {
  const isDisabled: (tabType?: T.ContentPageTabType) => boolean = (tabType) => {
    if (printingContentId) {
      return tabType !== T.ContentPageTabType.OVERLAY;
    }

    if (tabType === T.ContentPageTabType.ESS) {
      if (!features.ess) {
        return true;
      }
      return !has3DView;
    }

    return false;
  };

  const tabToButton: (tabType: T.ContentPageTabType) => ReactNode = (tabType) => {
    const handleTabButtonClick: () => void = () => {
      if (isDisabled(tabType)) return;

      onTabClick(tabType);
      preventAutoSelect();
    };

    const tooltipContent: string = `${tabToTooltip(tabType, language)}${
      isDisabled(tabType) ? ` ${l10n(Text.tooltipDisabled, language)}` : ''
    }`;

    return (
      <Tippy
        key={tabType}
        offset={T.TIPPY_OFFSET}
        theme='angelsw'
        placement='right'
        arrow={false}
        content={tooltipContent}
      >
        <TabItem
          isSelected={currentTab === tabType}
          onClick={handleTabButtonClick}
          data-testid={`contentstabbar-tabitem-${tabType}`}
          isDisabled={isDisabled(tabType)}
          data-ddm-track-action='change-tab'
          data-ddm-track-label={`btn-tab-${tabType.toLowerCase()}`}
        >
          {tabIconMap[tabType]}
        </TabItem>
      </Tippy>
    );
  };

  const handleUpload = (): void => {
    if (printingContentId) return;
    onUploadClick(role);
  };

  const handleLogoClick = (): void => {
    if (printingContentId) return;
    onLogoClick();
  };

  const allTabs: Array<T.ContentPageTabType> = getSidebarTabsByFeature(features);

  const upload: ReactNode = isPhone() ? undefined : (
    <Tippy offset={T.TIPPY_OFFSET} theme='angelsw' placement='right' arrow={false} content={l10n(Text.tooltipUpload, language)}>
      <UploadTab
        data-testid={'contentstabbar-addbutton'}
        className={CANCELLABLE_CLASS_NAME}
        isDisabled={isDisabled()}
        onClick={handleUpload}
        data-ddm-track-action='map-upload'
        data-ddm-track-label='btn-content-upload'
      >
        <UploadSVG />
      </UploadTab>
    </Tippy>
  );

  const logo: ReactNode = squareLogoUrl
    ? <CustomLogoImage src={squareLogoUrl} />
    : <AngelswingLogo />;

  return (
    <Root>
      <section>
        <Tippy
          offset={T.TIPPY_OFFSET}
          theme='angelsw'
          placement='right'
          arrow={false}
          content={l10n(Text.tooltipProjectLogo, language)}
        >
          <LogoTab className={CANCELLABLE_CLASS_NAME} onClick={handleLogoClick} isDisabled={isDisabled()}>
            {logo}
          </LogoTab>
        </Tippy>
        {allTabs.map(tabToButton)}
      </section>
      <section>
        {upload}
      </section>
    </Root>
  );
};

export default withL10n(withErrorBoundary(ContentsTabbar)(Fallback));
