import { ContextWithHOC, createContextWithHOC } from '@angelsw/react-utils';
import LayerGroup from 'ol/layer/Group';

type OlLayerGroupContext = LayerGroup;
export interface OlLayerGroupProps {
  layerGroup: OlLayerGroupContext;
}

export const {
  Provider,
  contextHOC: withOlLayerGroup,
}: ContextWithHOC<OlLayerGroupContext, OlLayerGroupProps> =
  /* istanbul ignore next */
  createContextWithHOC<OlLayerGroupContext, OlLayerGroupProps>(
    undefined as any,
    (layerGroup) => ({ layerGroup }),
    (name) => `OlLG(${name})`,
  );
