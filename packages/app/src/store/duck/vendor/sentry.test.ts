import * as Sentry from '@sentry/browser';

jest.mock('@sentry/browser');

import {
  deleteSentryUser,
  insertUserToSentry,
} from './sentry';

import { VendorUser } from '.';

const vendorUser: VendorUser = {
  email: 'test01@example.com',
  firstName: '스트',
  id: '1',
  lastName: '테',
  organization: '없음',
};

const sentryTester: (userInfo?: VendorUser) => void = (userInfo) => {
  const spy: jest.SpyInstance = jest.spyOn(Sentry, 'configureScope');
  if (userInfo) insertUserToSentry(userInfo);
  else deleteSentryUser();
  expect(Sentry.configureScope).toHaveBeenCalledWith(expect.any(Function));
  spy.mockClear();
};

describe('insertUserToSentry', () => {
  it('should call Sentry.configureScope', () => sentryTester(vendorUser));
});

describe('deleteSentryUser', () => {
  it('should call Sentry.configureScope', () => sentryTester());
});
