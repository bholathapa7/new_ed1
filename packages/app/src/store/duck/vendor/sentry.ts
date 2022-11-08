import * as Sentry from '@sentry/browser';
import { VendorUser } from '.';

export const insertUserToSentry: (vendorUser: VendorUser) => void = (vendorUser) => Sentry.configureScope((scope) => scope.setUser(vendorUser));
export const deleteSentryUser: () => void = () => Sentry.configureScope((scope) => scope.setUser(null));
