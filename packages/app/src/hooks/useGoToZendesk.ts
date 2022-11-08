import { useCallback } from 'react';
import { ajax } from 'rxjs/ajax';
import { map, tap } from 'rxjs/operators';

import { AuthHeader, makeV2APIURL } from '^/store/duck/API';
import { useAuthHeader } from './useAuthHeader';

export type UseGoToZendesk = (link: string) => void;

export const useGoToZendesk: () => UseGoToZendesk = () => {
  const authHeader: AuthHeader | undefined = useAuthHeader();

  return useCallback((link) => {
    if (authHeader === undefined) {
      return;
    }

    const URL: string = `${makeV2APIURL('faq')}?return_to=${link}`;

    ajax.get(URL, authHeader).pipe(
      map(({ response }) => response),
      tap(({ redirect_url }) => window.open(redirect_url)),
    ).subscribe();
  }, [authHeader?.Authorization]);
};
