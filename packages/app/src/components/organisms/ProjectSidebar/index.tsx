import React, { FC, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import styled, { CSSObject } from 'styled-components';

import { PoweredBy } from '^/components/atoms/PoweredBy';
import { RELEASE_VERSION } from '^/constants/data';
import palette from '^/constants/palette';
import { MediaQuery } from '^/constants/styles';
import AccountCard from '^/containers/molecules/AccountCard';
import * as T from '^/types';

const Root = styled.nav({
  flex: 'none',

  boxSizing: 'border-box',
  width: '300px',
  height: '100%',
  paddingTop: '50px',
  paddingLeft: '40px',
  paddingRight: '30px',

  borderRight: `1px solid ${palette.borderLight.toString()}`,

  backgroundColor: palette.background.toString(),

  [MediaQuery[T.Device.TABLET]]: {
    display: 'none',
  },
});

const VersionIndicator = styled.div({
  color: palette.textLight.toString(),
  fontSize: '13px',

  position: 'absolute',
  bottom: '50px',
});

const PoweredByStyle: CSSObject = {
  position: 'absolute',
  bottom: '28px',
  alignItems: 'flex-start',
  span: {
    color: palette.textLight.toString(),
  },
};

/**
 * Project page Sidebar component class
 */
const ProjectSidebar: FC = () => {
  // As long as slug exists, this means user uses a non-regular DDM platform.
  // This is to still show that their page is made by Angelswing.
  const needsCustomization: boolean = useSelector((state: T.State) => !!state.PlanConfig.config?.slug);
  const poweredBy: ReactNode = needsCustomization ? <PoweredBy customStyle={PoweredByStyle} /> : null;

  return (
    <Root>
      <AccountCard />
      <VersionIndicator>VER {RELEASE_VERSION}</VersionIndicator>
      {poweredBy}
    </Root>
  );
};

export default ProjectSidebar;
