import * as T from '^/types';

export const INQUIRY_CUSTOM_TAG: string = '<inquiry>';
export const EMAIL_CUSTOM_TAG: string = '<email>';

export default {
  errors: {
    [T.HTTPError.CLIENT_UNAUTHORIZED_ERROR]: {
      title: {
        [T.Language.KO_KR]: '요청하신 페이지의 권한이 없습니다.',
        [T.Language.EN_US]: 'Access Denied.',
      },
      description: {
        [T.Language.KO_KR]: `해당 프로젝트에 대한 권한이 없습니다.
        프로젝트의 소유자나 관리자에게 권한을 요청해 주세요.`,
        [T.Language.EN_US]: `You do not have permission to this project.
        Please request permission from the owner or manager of the project.`,
      },
      help: {
        [T.Language.KO_KR]: `관련 사항은 ${INQUIRY_CUSTOM_TAG} 또는 ${EMAIL_CUSTOM_TAG}로
        알려주시면 친절하게 안내해 드리겠습니다.`,
        [T.Language.EN_US]: `If you have any questions, please ${INQUIRY_CUSTOM_TAG} or
        let us know at ${EMAIL_CUSTOM_TAG}.`,
      },
    },
    [T.HTTPError.CLIENT_NOT_FOUND_ERROR]: {
      title: {
        [T.Language.KO_KR]: '요청하신 페이지를 찾을 수 없습니다.',
        [T.Language.EN_US]: 'Sorry, Page not found.',
      },
      description: {
        [T.Language.KO_KR]: `방문하시려는 페이지의 주소가 잘못 입력되었거나,
        페이지 주소의 변경 혹은 삭제되어 페이지를 찾을 수 없습니다.
        입력하신 주소가 정확한지 다시 한번 확인해 주시기 바랍니다.`,
        [T.Language.EN_US]: `The page you are trying to visit could not be found
        because the address was changed, deleted, or entered incorrectly.
        Please check whether the address you entered is correct.`,
      },
      help: {
        [T.Language.KO_KR]: `관련 사항은 ${INQUIRY_CUSTOM_TAG} 또는 ${EMAIL_CUSTOM_TAG}로
        알려주시면 친절하게 안내해 드리겠습니다.`,
        [T.Language.EN_US]: `If you have any questions, please ${INQUIRY_CUSTOM_TAG} or
        let us know at ${EMAIL_CUSTOM_TAG}.`,
      },
    },
    other: {
      title: {
        [T.Language.KO_KR]: 'Error',
        [T.Language.EN_US]: 'Error',
      },
      description: {
        [T.Language.KO_KR]: '에러가 발생했습니다. 페이지를 새로고침(F5) 하세요.',
        [T.Language.EN_US]: 'Error occured. Please refresh (F5) the page.',
      },
      help: {
        [T.Language.KO_KR]: `문제가 해결되지 않을 경우, 아래의 주소로 문의해주세요 (${EMAIL_CUSTOM_TAG}).`,
        [T.Language.EN_US]: `If the problem continues, please contact us at ${EMAIL_CUSTOM_TAG}.`,
      },
    },
  },
  inquiry: {
    [T.Language.KO_KR]: '문의하기',
    [T.Language.EN_US]: 'contact us',
  },
  viewProjectBoard: {
    [T.Language.KO_KR]: '프로젝트 보드 바로가기',
    [T.Language.EN_US]: 'View Project Board',
  },
};
