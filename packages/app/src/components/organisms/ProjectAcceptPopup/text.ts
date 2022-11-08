import { Language } from '^/types';

export default {
  title: {
    [Language.KO_KR]: '공유 확인하기',
    [Language.EN_US]: 'Project Shared',
  },
  /** @todo fix this when l10n can accept additional parameters */
  description: [
    {
      [Language.KO_KR]: '님이',
      [Language.EN_US]: 'shared the project,',
    },
    {
      [Language.KO_KR]: '프로젝트를 공유했습니다',
      [Language.EN_US]: '',
    },
  ],
  accept: {
    [Language.KO_KR]: '프로젝트 바로가기',
    [Language.EN_US]: 'View project',
  },
};
