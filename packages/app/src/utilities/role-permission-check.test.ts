import _ from 'lodash-es';

import * as T from '^/types';

import * as RPC from './role-permission-check';

const adminNMember: Array<T.PermissionRole> = [T.PermissionRole.ADMIN, T.PermissionRole.MEMBER];
const adminNViwer: Array<T.PermissionRole> = [T.PermissionRole.ADMIN, T.PermissionRole.VIEWER];
const pilotNMember: Array<T.PermissionRole> = [T.PermissionRole.PILOT, T.PermissionRole.MEMBER];

const allRoles: Array<T.PermissionRole> = Object.keys(T.PermissionRole)
  .map((key: keyof typeof T.PermissionRole) => T.PermissionRole[key]);

describe('isRoleFunctor', () => {
  it('gives a function to check against a role', () => {
    const func: RPC.IsRoleFunction = RPC.isRoleFunctor(T.PermissionRole.ADMIN);
    expect(func).toBeInstanceOf(Function);
    expect(func(T.PermissionRole.ADMIN)).toBe(true);
    [T.PermissionRole.PILOT, T.PermissionRole.MEMBER, T.PermissionRole.VIEWER].forEach(
      (role) => expect(func(role)).toBe(false),
    );
  });

  it('handles array of roles as input as well', () => {
    const func: RPC.IsRoleFunction = RPC.isRoleFunctor(adminNMember);
    expect(func).toBeInstanceOf(Function);
    adminNMember.forEach((role) => expect(func(role)).toBe(true));
    [T.PermissionRole.PILOT, T.PermissionRole.VIEWER]
      .forEach((role) => expect(func(role)).toBe(false));
  });
});

const isRoleTester: (idx: number, func: RPC.IsRoleFunction) => void = (idx, func) => {
  const roles: Array<T.PermissionRole> = [...allRoles];
  expect(func(roles[idx])).toBe(true);
  _.pullAt(roles, [idx]);
  roles.forEach((role) => expect(func(role)).toBe(false));
};

describe('IsRoleFunctions', () => {
  [
    {
      explanation: 'isRoleAdmin gives true for admin only',
      func: RPC.isRoleAdmin,
    },
    {
      explanation: 'isRoleMember gives true for member only',
      func: RPC.isRoleMember,
    },
    {
      explanation: 'isRoleViwer gives true for viewer only',
      func: RPC.isRoleViewer,
    },
    {
      explanation: 'isRolePilot gives true for pilot only',
      func: RPC.isRolePilot,
    },
  ].forEach(({ explanation, func }, idx) => {
    it(explanation, () => {
      isRoleTester(idx, func);
    });
  });
});

describe('isOneOfRoleFunctor', () => {
  it('gives a function to check against one of the roles provided', () => {
    const isAdminOrViwer: RPC.IsRoleFunction =
      RPC.isOneOfRoleFunctor([RPC.isRoleAdmin, RPC.isRoleViewer]);
    adminNViwer.forEach((role) => expect(isAdminOrViwer(role)).toBe(true));
    pilotNMember.forEach((role) => expect(isAdminOrViwer(role)).toBe(false));
  });
});

describe('isMemberOnAnnotation', () => {
  it('gives true for a member and annotation type', () => {
    expect(RPC.isMemberOnAnnotation(T.PermissionRole.MEMBER, T.ContentType.AREA)).toBe(true);
  });

  it('gives false for a non-member', () => {
    expect(RPC.isMemberOnAnnotation(T.PermissionRole.VIEWER, T.ContentType.MARKER)).toBe(false);
  });

  it('gives false for a wrong annotation type', () => {
    expect(RPC.isMemberOnAnnotation(T.PermissionRole.MEMBER, T.ContentType.MAP)).toBe(false);
  });
});


describe('isAllowDeleteContent', () => {
  it('gives true for member and admin, with a correct contentType', () => {
    [[T.PermissionRole.ADMIN, T.ContentType.LENGTH],
      [T.PermissionRole.MEMBER, T.ContentType.VOLUME],
      [T.PermissionRole.PILOT, T.ContentType.VOLUME],
      [T.PermissionRole.DEMO, T.ContentType.LENGTH]]
      .forEach(([role, cType]: [T.PermissionRole, T.ContentType]) => {
        expect(RPC.isAllowDeleteContent(role, cType)).toBe(true);
      });
  });

  it('gives false for wrong roles', () => {
    expect(RPC.isAllowDeleteContent(T.PermissionRole.VIEWER, T.ContentType.LENGTH)).toBe(false);
  });
});

describe('isAllowEditBlueprint', () => {
  it('gives true for blueprint only', () => {
    expect(RPC.isAllowEditBlueprint(T.PermissionRole.ADMIN, T.ContentType.BLUEPRINT_PDF)).toBe(true);
    expect(RPC.isAllowEditBlueprint(T.PermissionRole.ADMIN, T.ContentType.BLUEPRINT_DXF)).toBe(false);
    expect(RPC.isAllowEditBlueprint(T.PermissionRole.PILOT, T.ContentType.BLUEPRINT_PDF)).toBe(true);
    expect(RPC.isAllowEditBlueprint(T.PermissionRole.PILOT, T.ContentType.MAP)).toBe(false);
  });

  it('gives false for wrong roles', () => {
    expect(RPC.isAllowEditBlueprint(T.PermissionRole.MEMBER, T.ContentType.BLUEPRINT_PDF)).toBe(false);
  });
});

describe('isAllowEditContent', () => {
  it('gives true for the content that is not blueprint and an accepted role', () => {
    expect(RPC.isAllowEditContent(T.PermissionRole.MEMBER, T.ContentType.MAP)).toBe(true);
  });

  it('gives true for a condition that fulfills isAllowEditBlueprint', () => {
    expect(RPC.isAllowEditContent(T.PermissionRole.PILOT, T.ContentType.BLUEPRINT_PDF)).toBe(true);
  });
});
