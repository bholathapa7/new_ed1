import _ from 'lodash-es';
import { WebStorage } from 'redux-persist';
import { default as webLocalStorage } from 'redux-persist/lib/storage';
import { default as webSessionStorage } from 'redux-persist/lib/storage/session';

export interface DDMSESSIONObject {
  readonly DDMSESSION?: string;
}
export const DDMSESSION: keyof DDMSESSIONObject = 'DDMSESSION';

/* eslint-disable @typescript-eslint/promise-function-async */
const customStorage: WebStorage = {
  getItem(key: string): Promise<string> {
    return Promise.all([
      webLocalStorage.getItem(key),
      webSessionStorage.getItem(key),
    ])
      .then(([localItem, sessionItem]) => {
        let item: object = {};

        if (localItem) {
          item = { ...item, ...JSON.parse(localItem) };
        }
        if (sessionItem) {
          item = { ...item, ...JSON.parse(sessionItem) };
        }

        return JSON.stringify(item);
      })
      .catch((e) => {
        throw e;
      });
  },
  setItem(key: string, value: string): Promise<void> {
    const valueObj: object = JSON.parse(value);

    const localValue: string = JSON.stringify(_.omit(valueObj, DDMSESSION));
    const sessionValue: string = JSON.stringify(_.pick(valueObj, DDMSESSION));

    return Promise.all([
      webLocalStorage.setItem(key, localValue),
      webSessionStorage.setItem(key, sessionValue),
    ])
      .then(() => undefined)
      .catch((e) => {
        throw e;
      });
  },
  removeItem(key: string): Promise<void> {
    return Promise.all([
      webLocalStorage.removeItem(key),
      webSessionStorage.removeItem(key),
    ])
      /**
       * @desc ignore array result
       */
      .then(() => undefined)
      .catch((e) => {
        throw e;
      });
  },
};

export default customStorage;
