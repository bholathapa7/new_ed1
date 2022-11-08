import * as T from '^/types';

export default {
  authorization: {
    [T.Language.KO_KR]: '권한이 필요합니다.',
    [T.Language.EN_US]: 'Permission Required',
  },
  description: {
    [T.Language.KO_KR]: '이 기능을 사용할 수 있는 권한이 없습니다.',
    [T.Language.EN_US]: 'You are not authorized to use this feature.',
  },
  admin: {
    [T.Language.KO_KR]: '보기, 내용 수정/삭제, 파일 올리기, 프로젝트 공유',
    [T.Language.EN_US]: 'View, Edit/Delete content, Upload files, Share project',
  },
  member: {
    [T.Language.KO_KR]: '보기, 내용 수정',
    [T.Language.EN_US]: 'View, Edit content',
  },
  demo: {
    [T.Language.KO_KR]: '보기, 개인 측정 수정',
    [T.Language.EN_US]: 'View, Edit personal measurements',
  },
  viewer: {
    [T.Language.KO_KR]: '보기',
    [T.Language.EN_US]: 'View',
  },
  pilot: {
    [T.Language.KO_KR]: '보기, 내용 수정/삭제, 파일 올리기',
    [T.Language.EN_US]: 'View, Edit/delete contents, Upload data',
  },
  submit: {
    [T.Language.KO_KR]: '확인',
    [T.Language.EN_US]: 'Confirm',
  },
  roles: {
    [T.PermissionRole.ADMIN]: {
      [T.Language.KO_KR]: '관리자',
      [T.Language.EN_US]: 'Admin',
    },
    [T.PermissionRole.MEMBER]: {
      [T.Language.KO_KR]: '멤버',
      [T.Language.EN_US]: 'Member',
    },
    [T.PermissionRole.VIEWER]: {
      [T.Language.KO_KR]: '뷰어',
      [T.Language.EN_US]: 'Viewer',
    },
    [T.PermissionRole.DEMO]: {
      [T.Language.KO_KR]: '데모',
      [T.Language.EN_US]: 'Demo',
    },
    [T.PermissionRole.PILOT]: {
      [T.Language.KO_KR]: '파일럿',
      [T.Language.EN_US]: 'Pilot',
    },
  },
};
