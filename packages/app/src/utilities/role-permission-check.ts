import * as T from '^/types';

export type IsRoleFunction = (role: T.PermissionRole) => boolean;
export type isRoleFunctor = (
  roleToCheckAgainst: T.PermissionRole | Array<T.PermissionRole>,
) => IsRoleFunction;

/**
 * Check if the role is one of 'roleToCheckAgainst'(s)
 */
export const isRoleFunctor: isRoleFunctor = (
  roleToCheckAgainst,
) => (
  role,
) => Array.isArray(roleToCheckAgainst) ?
  roleToCheckAgainst.includes(role) :
  roleToCheckAgainst === role;

export type isOneOfRoleFunctor = (roleFunctors: Array<IsRoleFunction>) => IsRoleFunction;
export const isOneOfRoleFunctor: isOneOfRoleFunctor = (roleFunctors) =>
  (role) => roleFunctors.some((fn) => fn(role));

export const isRoleAdmin: IsRoleFunction = isRoleFunctor(T.PermissionRole.ADMIN);
export const isRoleMember: IsRoleFunction = isRoleFunctor(T.PermissionRole.MEMBER);
export const isRoleViewer: IsRoleFunction = isRoleFunctor(T.PermissionRole.VIEWER);
export const isRolePilot: IsRoleFunction = isRoleFunctor(T.PermissionRole.PILOT);
export const isRoleDemo: IsRoleFunction = isRoleFunctor(T.PermissionRole.DEMO);

const isRoleAdminOrPilotFunctor: IsRoleFunction = isOneOfRoleFunctor([isRoleAdmin, isRolePilot]);
const isRoleAdminOrMemberOrDemoFunctor: IsRoleFunction = isOneOfRoleFunctor([isRoleAdmin, isRoleMember, isRoleDemo]);
const isRoleAdminOrMemberOrPilotFunctor: IsRoleFunction =
  isOneOfRoleFunctor([isRoleAdminOrMemberOrDemoFunctor, isRolePilot]);

export {
  isRoleAdmin as isAllowProjectShare,
  isRoleAdminOrPilotFunctor as isAllowToUpload,
  isRoleAdminOrPilotFunctor as isAllowDownloadPopup,
  isRoleAdminOrPilotFunctor as isAllowScreenTitleChange,
  isRoleAdminOrPilotFunctor as isAllowAcessEventLogs,
  isRoleAdminOrMemberOrPilotFunctor as isAllowSharePopup,
  isRoleAdminOrMemberOrPilotFunctor as isAllowPrint,
  isRoleAdminOrMemberOrPilotFunctor as isAllowMarkerAttachOrDelete,
  isRoleAdminOrMemberOrPilotFunctor as isAllowToggleDSMElevation,
  isRoleAdminOrMemberOrPilotFunctor as isAllowExportMultipleElevation,
};

export type roleAndContentTypeToBoolean = (
  role: T.PermissionRole, contentType: T.ContentType,
) => boolean;

/**
 * Check if Member role and content type is Annotation
 */
export const isMemberOnAnnotation: roleAndContentTypeToBoolean = (
  role, contentType,
) => isRoleAdminOrMemberOrDemoFunctor(role) && [
  T.ContentType.MARKER,
  T.ContentType.LENGTH,
  T.ContentType.AREA,
  T.ContentType.VOLUME,
].some((contentToCheckAgainst) => contentType === contentToCheckAgainst);

/**
 * Check whether the Role is allowed to delete a Content or not
 */
export const isAllowDeleteContent: roleAndContentTypeToBoolean = (
  role, contentType,
) => isMemberOnAnnotation(role, contentType) || isRoleAdminOrPilotFunctor(role);

/**
 * Check if Admin role and content type is Blueprint
 */
export const isAllowEditBlueprint: roleAndContentTypeToBoolean = (
  role, contentType,
) => contentType === T.ContentType.BLUEPRINT_PDF && isRoleAdminOrPilotFunctor(role);

/**
 * Check whether the Role is allowed to edit a Content or not
 */
export const isAllowEditContent: roleAndContentTypeToBoolean = (
  role, contentType,
) => isAllowEditBlueprint(role, contentType) ||
  (
    contentType !== T.ContentType.BLUEPRINT_PDF &&
    isRoleAdminOrMemberOrPilotFunctor(role)
  );
