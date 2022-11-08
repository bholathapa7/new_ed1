import jwtDecode, { JWT } from 'jwt-decode';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { HEADER_SLUG_PROP } from '^/constants/network';
import { AuthHeader } from '^/store/duck/API';
import * as T from '^/types';

const MSEC_IN_SEC: number = 1000;

export function useAuthHeader(): AuthHeader | undefined {
  const token: string | undefined = useSelector((state: T.State) => state.Auth?.authedUser?.token);
  const slug: T.PlanConfig['slug'] = useSelector((state: T.State) => state.PlanConfig.config?.slug);

  const jwt: JWT | undefined = useMemo(() => token !== undefined ? jwtDecode(token) : undefined, [token]);

  return useMemo(() => token === undefined || jwt?.exp === undefined || jwt.exp <= Date.now() / MSEC_IN_SEC ? undefined : ({
    Authorization: token,
    [HEADER_SLUG_PROP]: slug,
  }), [token, jwt, slug]);
}
