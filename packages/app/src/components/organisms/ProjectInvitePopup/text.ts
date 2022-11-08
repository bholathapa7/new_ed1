import { Language, PermissionRole } from '^/types';

export default {
  title: {
    [Language.KO_KR]: '프로젝트 팀멤버 초대하기',
    [Language.EN_US]: 'User Invitation',
  },
  bigDescription: {
    [Language.KO_KR]: '이메일로 팀멤버를 초대하여 함께 작업해보세요',
    [Language.EN_US]: 'Invite team members to collaborate on a project',
  },
  emailTitle: {
    [Language.KO_KR]: '이메일 입력',
    [Language.EN_US]: 'Email',
  },
  openProject: {
    [Language.KO_KR]: '프로젝트 보기',
    [Language.EN_US]: 'View project',
  },
  emailPlaceholder: {
    [Language.KO_KR]: '이메일을 입력하세요',
    [Language.EN_US]: 'Enter an email address',
  },
  defaultRole: {
    [Language.KO_KR]: '선택',
    [Language.EN_US]: 'Select',
  },
  role: {
    [PermissionRole.ADMIN]: {
      name: {
        [Language.KO_KR]: '관리자',
        [Language.EN_US]: 'Admin',
      },
      description: {
        [Language.KO_KR]: '프로젝트 보기, 컨텐츠 수정/삭제, 데이터 업로드, 프로젝트 공유',
        [Language.EN_US]: 'can view, edit/delete contents, upload data, share project',
      },
    },
    [PermissionRole.PILOT]: {
      name: {
        [Language.KO_KR]: '파일럿',
        [Language.EN_US]: 'Pilot',
      },
      description: {
        [Language.KO_KR]: '프로젝트 보기, 컨텐츠 수정/삭제, 데이터 업로드',
        [Language.EN_US]: 'can view, edit/delete contents, upload data',
      },
    },
    [PermissionRole.MEMBER]: {
      name: {
        [Language.KO_KR]: '멤버',
        [Language.EN_US]: 'Member',
      },
      description: {
        [Language.KO_KR]: '프로젝트 보기, 컨텐츠 수정',
        [Language.EN_US]: 'can view, edit contents',
      },
    },
    [PermissionRole.VIEWER]: {
      name: {
        [Language.KO_KR]: '뷰어',
        [Language.EN_US]: 'Viewer',
      },
      description: {
        [Language.KO_KR]: '프로젝트 보기',
        [Language.EN_US]: 'can view only',
      },
    },
  },
};
