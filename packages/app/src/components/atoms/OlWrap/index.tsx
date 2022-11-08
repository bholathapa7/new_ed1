import { ComponentType, FC } from 'react';

import { OlLayerGroupProps, withOlLayerGroup } from '^/components/atoms/OlLayerGroup/context';
import { OlMapProps, withOlMap } from '^/components/atoms/OlMapProvider/context';

export type WrapperProps = OlMapProps & Partial<OlLayerGroupProps>;

export type OlProps<P> = WrapperProps & P;
export type OlFC<P = {}> = FC<P & WrapperProps>;

/**
 * @author Junyoung Clare Jang <clare.angelswing@gmail.com>
 * @desc HOC for transform context to props
 */
export default function olWrap<P extends object>(
  C: ComponentType<OlProps<P>>,
): FC<P> {
  /**
   * @author Junyoung Clare Jang <clare.angelswing@gmail.com>
   * @desc Wrapped component
   */
  const result: any = withOlMap(withOlLayerGroup(C));
  result.displayName = (result.displayName as string).replace(/OlM\(OlLG\((.*)\)\)/, 'Ol($1)');

  return result;
}
