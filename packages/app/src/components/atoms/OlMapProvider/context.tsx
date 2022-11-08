import { ContextWithHOC, createContextWithHOC } from '@angelsw/react-utils';
import Map from 'ol/Map';

type OlMapContext = Map;
export interface OlMapProps {
  readonly map: OlMapContext;
}

export const {
  Provider,
  contextHOC: withOlMap,
}: ContextWithHOC<OlMapContext, OlMapProps> =
  /* istanbul ignore next */
  createContextWithHOC<OlMapContext, OlMapProps>(
    undefined as any,
    (map) => ({ map }),
    (name) => `OlM(${name})`,
  );
