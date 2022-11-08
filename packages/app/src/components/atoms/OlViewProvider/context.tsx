import { ContextWithHOC, createContextWithHOC } from '@angelsw/react-utils';
import View from 'ol/View';

type OlViewContext = View;
export interface OlViewProps {
  readonly view: OlViewContext;
}
export const {
  Provider,
  contextHOC: withOlView,
}: ContextWithHOC<OlViewContext, OlViewProps> =
  /* istanbul ignore next */
  createContextWithHOC<OlViewContext, OlViewProps>(
    undefined as any,
    (view) => ({ view }),
    (name) => `OlV(${name})`,
  );
