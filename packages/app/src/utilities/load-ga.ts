import config, { BuildLevel } from '^/config';
import { getDDMSubdomain } from '^/store/duck/router';
import { ESSPlanConfig } from '^/store/duck/PlanConfig';

const GA_TRACK_PROD_ID = 'UA-109998374-1';
const GA_TRACK_DEV_ID = 'UA-109998374-4';
const GA_TRACK_ESS_PROD_ID = 'UA-109998374-5';
const GA_TRACK_ESS_DEV_ID = 'UA-109998374-6';

export const loadGA: (global: any, propertyId: string) => void = (
  global, propertyId,
) => {
  global.GoogleAnalyticsObject = 'ga';
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  global.ga = global.ga || function (): void {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    global.ga.q = global.ga.q || [];
    global.ga.q.push(arguments);
  };
  global.ga.l = new Date().valueOf();

  const newScript: HTMLScriptElement = document.createElement('script');
  newScript.async = true;
  newScript.src = 'https://www.google-analytics.com/analytics.js';

  const oldScript: HTMLScriptElement = document.getElementsByTagName('script')[0];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  oldScript.parentNode!.insertBefore(newScript, oldScript);

  global.ga('create', propertyId, 'auto');
};

export const activateGA: boolean = config.isBrowser && !config.isNotProduction;

export const initializeGA: () => void = () => {
  if (activateGA) {
    loadGA(window, getTrackId());
  }
};

export const getTrackId: () => string = () => {
  const isDomainESS = getDDMSubdomain() === ESSPlanConfig.slug;
  if (config.buildLevel === BuildLevel.PRODUCTION) {
    return isDomainESS ? GA_TRACK_ESS_PROD_ID : GA_TRACK_PROD_ID;
  }

  return isDomainESS ? GA_TRACK_ESS_DEV_ID : GA_TRACK_DEV_ID;
};
