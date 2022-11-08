/**
 * FIXME
 * If type of redux-observable is fixed, <- I send a PR to them.
 * Plz remove this declaration.
 */
import * as enzyme from 'enzyme';
import Jest from 'jest';
import jwtDecode from 'jwt-decode';


declare module 'jwt-decode' {
  // Ref: https://tools.ietf.org/html/rfc7519#section-4
  interface JWT {
    [key: string]: any;
    iss?: string;
    sub?: string;
    aud?: string;
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
  }
}

declare module 'enzyme' {
  import { ReactElement } from 'react';

  /* eslint-disable max-len */
  export function shallowContext<C extends Component, CtxtP, P = C['props'], S = C['state']>(node: ReactElement<P>, options?: ShallowRendererProps, ...context: Array<any>): ShallowWrapper<P & CtxtP, S, C>;
  export function shallowContext<CtxtP, P>(node: ReactElement<P>, options?: ShallowRendererProps, ...context: Array<any>): ShallowWrapper<P & CtxtP, any>;
  export function shallowContext<CtxtP, P, S>(node: ReactElement<P>, options?: ShallowRendererProps, ...context: Array<any>): ShallowWrapper<P & CtxtP, S>;
  /* eslint-enable max-len */
}
