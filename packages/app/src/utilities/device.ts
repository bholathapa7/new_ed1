import MobileDetect from 'mobile-detect';

const md: MobileDetect = new MobileDetect(window.navigator.userAgent);

export const isPhone: () => boolean = () => Boolean(md.mobile()) && !Boolean(md.tablet());

export const isMobile: () => boolean = () => Boolean(md.mobile());
