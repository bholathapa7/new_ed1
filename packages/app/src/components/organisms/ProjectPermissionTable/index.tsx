import React, { FC, ReactElement, ReactNode } from 'react';
import styled from 'styled-components';

import withL10n, { L10nProps } from '^/components/atoms/WithL10n';
import ProjectPermissionItem from '^/components/molecules/ProjectPermissionItem';
import palette from '^/constants/palette';
import { MediaQuery } from '^/constants/styles';
import * as T from '^/types';
import { l10n } from '^/utilities/l10n';
import { isRoleAdmin } from '^/utilities/role-permission-check';
import Text from './text';

const Root = styled.table({
  width: '100%',
  marginTop: '20px',

  borderTopWidth: '2px',
  borderTopStyle: 'solid',
  borderTopColor: palette.icon.toString(),
  borderBottomWidth: '2px',
  borderBottomStyle: 'solid',
  borderBottomColor: palette.icon.toString(),
});

interface HeaderColumnProps {
  readonly columnMinWidth: number;
  readonly columnRatio: number;
}
const HeaderColumn = styled.th<HeaderColumnProps>({
  paddingTop: '8px',
  paddingBottom: '8px',
  ':not(:first-of-type) > span': {
    borderLeftWidth: '1px',
    borderLeftStyle: 'solid',
    borderLeftColor: palette.icon.toString(),
  },

  [MediaQuery.MOBILE_L]: {
    display: 'none',
  },
}, ({ columnMinWidth, columnRatio }) => ({
  minWidth: `${columnMinWidth}px`,
  width: `${columnRatio}%`,
}));

const HeaderText = styled.span({
  display: 'inline-block',
  width: '100%',
  fontSize: '13px',
  lineHeight: 1,
  fontWeight: 500,
  color: palette.icon.toString(),
  textAlign: 'center',
});

const Body = styled.tbody({
  borderTopWidth: '1px',
  borderTopStyle: 'solid',
  borderTopColor: palette.icon.toString(),

  '& > tr + tr': {
    marginTop: '10px',
  },
});

const Spacer = styled.tr({
  height: '10px',
  backgroundColor: palette.transparent.toString(),
});

export interface Props {
  readonly authedId?: T.User['id'];
  readonly authedRole: T.PermissionRole;
  readonly permissions: Array<[T.RestrictedUser, T.Permission]>;
  readonly featurePermission: Record<number, T.RestrictedUser>;
  onDelete(id: T.Permission['id'], isNoPermission: boolean): void;
  onPermissionChange(id: T.Permission['id'], role: T.PermissionRole, isNoPermission: boolean): void;
  onFeaturePermissionChange(id: T.Permission['id'], role: T.PermissionRole, isESS: boolean, isNoPermission: boolean): void;
}

/**
 * Component for table of permission on manage page
 */

const ProjectPermissionTable: FC<Props & L10nProps> = ({
  permissions, language, onDelete, onPermissionChange, authedRole, authedId, onFeaturePermissionChange, featurePermission,
}) => {
  const generateItem: () => ReactNode = () => {
    const result: Array<ReactElement<object>> = [];

    permissions.forEach(([user, permission], index) => {
      const hasPermission: boolean =
        isRoleAdmin(authedRole) &&
        authedId !== user.id;

      const handleDelete: () => void = () => onDelete(permission.id, hasPermission);
      const handlePermissionChange: (id: T.Permission['id'], role: T.PermissionRole) => void =
        (id, role) => onPermissionChange(id, role, hasPermission);

      const handleFeaturePermissionChange: (id: T.Permission['id'], role: T.PermissionRole, isESS: boolean) => void = (id, role, isESS: boolean) => {
        onFeaturePermissionChange(id, role, isESS, hasPermission);
      };

      if (result.length !== 0) {
        result.push(<Spacer key={`spacer${user.id}`} />);
      }
      result.push(
        <ProjectPermissionItem
          key={user.id}
          user={user}
          permission={permission}
          zIndex={permissions.length - index}
          onDelete={handleDelete}
          onPermissionChange={handlePermissionChange}
          onFeaturePermissionChange={handleFeaturePermissionChange}
          featurePermission={featurePermission}
        />,
      );
    });

    return result;
  };

  /* eslint-disable no-magic-numbers */
  return (
    <Root>
      <thead>
        <tr>
          <HeaderColumn columnMinWidth={150} columnRatio={30}>
            <HeaderText>{l10n(Text.name, language)}</HeaderText>
          </HeaderColumn>
          <HeaderColumn columnMinWidth={170} columnRatio={30}>
            <HeaderText>{l10n(Text.email, language)}</HeaderText>
          </HeaderColumn>
          <HeaderColumn columnMinWidth={100} columnRatio={20}>
            <HeaderText>{l10n(Text.team, language)}</HeaderText>
          </HeaderColumn>
          <HeaderColumn columnMinWidth={130} columnRatio={10}>
            <HeaderText>{l10n(Text.authority, language)}</HeaderText>
          </HeaderColumn>
          <HeaderColumn columnMinWidth={130} columnRatio={10}>
            <HeaderText>{l10n(Text.featureToggle.ess, language)}</HeaderText>
          </HeaderColumn>
          <HeaderColumn columnMinWidth={60} columnRatio={10}>
            <HeaderText>{l10n(Text.delete, language)}</HeaderText>
          </HeaderColumn>
        </tr>
      </thead>
      <Body>{generateItem()}</Body>
    </Root>
  );
  /* eslint-enable no-magic-numbers */
};

export default withL10n(ProjectPermissionTable);
