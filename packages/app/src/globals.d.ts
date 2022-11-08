import { Overwrite as _Overwrite } from '@angelsw/type-utils';
import { ApmBase } from '@elastic/apm-rum';

declare global {
  type Overwrite<T extends Partial<Record<keyof U, any>>, U> = _Overwrite<T, U>;
  namespace jest {
    interface Matchers {
      toHaveStyleRule(property: string, value: string | RegExp): void;
    }
  }

  /**
   * @desc
   * This type is used for `ContentSharePopup`.
   */
  interface Window {
    readonly clipboardData?: {
      setData(format: string, data: string): void;
    };
    zESettings: any;
    elasticApm: ApmBase;
    zE?(configObjectType: string, property: string, payload?: { [key: string]: any } | string): void;
  }

  interface GACreateOnlyFields {
    trackingId?: string;
    name?: string;
    clientId?: string;
    sampleRate?: number;
    siteSpeedSampleRate?: number;
    alwaysSendReferrer?: boolean;
    allowAnchor?: boolean;
    cookieName?: string;
    cookieDomain?: string;
    cookieExpires?: number;
    storeGac?: boolean;
    legacyCookieDomain?: string;
    legacyHistoryImport?: boolean;
    allowLinker?: boolean;
  }

  interface GAGeneralFields {
    anonymizeIp?: boolean;
    dataSource?: string;
    queueTime?: number;
    forceSSL?: boolean;
    transport?: string;
    useBeacon?: boolean;
    linkerParam?: string;
    hitCallback?: (() => void) | undefined;
    userId?: string;
    sessionControl?: string;
    referrer?: string;
    campaignName?: string;
    campaignSource?: string;
    campaignMedium?: string;
    campaignKeyword?: string;
    campaignContent?: string;
    campaignId?: string;
    screenResolution?: string;
    viewportSize?: string;
    encoding?: string;
    screenColors?: string;
    language?: string;
    javaEnabled?: string;
    flashVersion?: string;
    hitType?: string;
    nonInteraction?: boolean;
    location?: string;
    hostname?: string;
    page?: string;
    title?: string;
    contentGroup?: string;
    linkid?: string;
    appName?: string;
    appId?: string;
    appVersion?: string;
    appInstallerId?: string;
  }

  interface GASendScreenViewOnlyFields {
    screenName?: string;
  }

  interface GASendEventOnlyFields {
    eventCategory?: string;
    eventAction?: string;
    eventLabel?: string;
    eventValue?: number;
  }

  interface GASendSocialOnlyFields {
    socialNetwork?: string;
    socialAction?: string;
    socialTarget?: string;
  }

  interface GASendTimingOnlyFields {
    timingCategory?: string;
    timingVar?: string;
    timingValue?: number;
    timingLabel?: string;
  }

  interface GASendExceptionOnlyFields {
    exDescription?: string;
    exFatal?: boolean;
  }

  interface GACreateFields extends GACreateOnlyFields, GAGeneralFields {}
  type GASendPageviewFields = GAGeneralFields;
  interface GASendScreenviewFields extends GASendScreenViewOnlyFields, GAGeneralFields {}
  interface GASendEventFields extends GASendEventOnlyFields, GAGeneralFields {}
  type GASendTransactionFields = GAGeneralFields;
  type GASendItemFields = GAGeneralFields;
  interface GASendSocialFields extends GASendSocialOnlyFields, GAGeneralFields {}
  interface GASendExceptionFields extends GASendExceptionOnlyFields, GAGeneralFields {}
  interface GASendTimingFields extends GASendTimingOnlyFields, GAGeneralFields {}

  interface GAAllFields extends
  GACreateFields,
  GASendScreenViewFields,
  GASendEventFields,
  GASendTransactionFields,
  GASendItemFields,
  GASendSocialFields,
  GASendExceptionFields,
  GASendTimingFields {}

  interface GATracker {
    get(fieldName: string): any;

    set(fieldsObject: GACreateFields): void;
    set<K extends keyof GAAllFields>(fieldName: K, fieldValue: GAAllFields[K]): void;
    set(fieldName: string, fieldValue: any): void;

    send(hitType: 'pageview', fieldsObject?: GASendPageviewFields): void;
    send(hitType: 'screenview', fieldsObject?: GASendScreenViewFields): void;
    send(hitType: 'event', fieldsObject?: GASendEventFields): void;
    send(hitType: 'transaction', fieldsObject?: GASendTransactionFields): void;
    send(hitType: 'item', fieldsObject?: GASendItemFields): void;
    send(hitType: 'social', fieldsObject?: GASendSocialFields): void;
    send(hitType: 'exception', fieldsObject?: GASendExceptionFields): void;
    send(hitType: 'timing', fieldsObject?: GASendTimingFields): void;
    send(hitType: string, ...args: any): void;
    send(fieldsObject: GAAllFields): void;
    send(...args: any): void;
  }

  interface GA {
    (readyCallback: (tracker?: GATracker) => void): void;

    (command: 'create', fieldsObject?: GACreateFields): void;
    (command: 'create', trackingId?: string, fieldsObject?: GACreateFields): void;
    (command: 'create', trackingId?: string, cookieDomain?: string, fieldsObject?: GACreateFields): void;
    (command: 'create', trackingId?: string, cookieDomain?: string, name?: string, fieldsObject?: GACreateFields): void;

    (command: 'set', fieldsObject: GAAllFields): void;
    <K extends keyof GAAllFields>(command: 'set', fieldName: K, fieldValue: GAAllFields[K]): void;
    (command: 'set', fieldName: string, fieldValue: any): void;

    (command: 'send', hitType: 'pageview', fieldsObject?: GASendPageviewFields): void;
    (command: 'send', hitType: 'screenview', fieldsObject?: GASendScreenviewFields): void;
    (command: 'send', hitType: 'event', fieldsObject?: GASendEventFields): void;
    (command: 'send', hitType: 'transaction', fieldsObject?: GASendTransactionFields): void;
    (command: 'send', hitType: 'item', fieldsObject?: GASendItemFields): void;
    (command: 'send', hitType: 'social', fieldsObject?: GASendSocialFields): void;
    (command: 'send', hitType: 'exception', fieldsObject?: GASendExceptionFields): void;
    (command: 'send', hitType: 'timing', fieldsObject?: GASendTimingFields): void;
    (command: 'send', hitType: string, ...args: any): void;
    // eslint-disable-next-line @typescript-eslint/unified-signatures
    (command: 'send', fieldsObject: GAAllFields): void;

    (command: 'require', pluginName: string, pluginOptions?: object): void;

    (command: 'provide', pluginName: string, pluginConstuctor: new (...args: any) => any): void;

    (command: 'remove');

    (command: string, ...args: any): void;

    create(fieldsObject?: GACreateFields): GATracker;
    create(trackingId?: string, fieldsObject?: GACreateFields): GATracker;
    create(trackingId?: string, cookieDomain?: string, fieldsObject?: GACreateFields): GATracker;
    create(trackingId?: string, cookieDomain?: string, name?: string, fieldsObject?: GACreateFields): GATracker;
    getByName(name: string): GATracker;
    getAll(): Array<GATracker>;
    remove(name: string): void;
  }

  const ga: GA;

  // Hotjar
  type HJ = (type: 'trigger', value: string) => void;
  const hj: HJ | undefined;
}

export {};
