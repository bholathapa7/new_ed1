import { compile } from 'path-to-regexp';

import { Language } from '^/types';


const route = {
  login: {
    main: '/login',
  },
  password: {
    main: '/password',
    reset: '/reset_password/:token(.*)',
    createReset: (token: string) => compile(route.password.reset)({ token }),
  },
  signup: {
    main: '/signup',
    request: '/signup/request',
    processing: '/signup/processing',
  },
  project: {
    main: '/project',
    mypage: '/project/mypage',
    manage: '/project/:id(\\d+)/manage',
    createManage: (id: number) => compile(route.project.manage)({ id }),
  },
  content: {
    main: '/project/:id(\\d+)/content',
    createMain: (id: number) => compile(route.content.main)({ id }),
  },
  share: {
    main: '/share/:token(.*)',
    createMain: (token: string) => compile(route.share.main)({ token }),
  },
  /* eslint-disable max-len */
  externalLink: {
    terms: 'https://support.angelswing.io/hc/ko/articles/360034626674-%ED%94%8C%EB%9E%AB%ED%8F%BC-%EC%9D%B4%EC%9A%A9%EC%95%BD%EA%B4%80-',
    privatePolicy: 'https://support.angelswing.io/hc/ko/articles/360034629674-%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4%EC%B2%98%EB%A6%AC%EB%B0%A9%EC%B9%A8',
    homepage: 'https://angelswing.io',
    support: {
      [Language.KO_KR]: 'https://angelswing.notion.site/0eed365c69fd49d8aeb6377a0518ed77',
      [Language.EN_US]: 'https://support.angelswing.io/hc/en',
    },
    essSupport: {
      [Language.KO_KR]: 'https://angelswing.notion.site/ESS-c3d5a22aa82e4a279abd5ad4cd8b874d',
      [Language.EN_US]: 'https://angelswing.notion.site/ESS-c3d5a22aa82e4a279abd5ad4cd8b874d',
    },
    chromeDownloadURL: 'https://www.google.com/chrome/',
    chromeMoreInformationURL: 'https://support.angelswing.io/hc/ko/articles/360039595374--%EC%A4%91%EC%9A%94-%EA%B3%B5%EC%A7%80-%EC%97%94%EC%A0%A4%EC%8A%A4%EC%9C%99-%ED%94%8C%EB%9E%AB%ED%8F%BC-1-9-3-%EB%B2%84%EC%A0%84%EB%B6%80%ED%84%B0-%EC%9D%B8%ED%84%B0%EB%84%B7-%EC%9D%B5%EC%8A%A4%ED%94%8C%EB%A1%9C%EB%9F%AC-%EC%A7%80%EC%9B%90%EC%9D%84-%EC%A4%91%EB%8B%A8%ED%95%A9%EB%8B%88%EB%8B%A4-',
    howToMakeDesignURL: 'https://support.angelswing.io/hc/ko/articles/360039595374--%EC%A4%91%EC%9A%94-%EA%B3%B5%EC%A7%80-%EC%97%94%EC%A0%A4%EC%8A%A4%EC%9C%99-%ED%94%8C%EB%9E%AB%ED%8F%BC-1-9-3-%EB%B2%84%EC%A0%84%EB%B6%80%ED%84%B0-%EC%9D%B8%ED%84%B0%EB%84%B7-%EC%9D%B5%EC%8A%A4%ED%94%8C%EB%A1%9C%EB%9F%AC-%EC%A7%80%EC%9B%90%EC%9D%84-%EC%A4%91%EB%8B%A8%ED%95%A9%EB%8B%88%EB%8B%A4-',
  },
};
export default route;
