import { Entity } from 'cesium';

import * as T from '^/types';
import {
  useContentSetLocations,
  useEdge,
  useEntityColorChange,
  useEntityTitleChange,
} from '../../CesiumHooks';

export interface IGeometryBehavior {
  titleChange(content?: T.GeometryContent): void;
  colorChange(content?: T.GeometryContent): void;
  setEdge(content?: T.GeometryContent): () => void;
  setLocations(content?: T.GeometryContent, entity?: Entity): void;
}

export const GeometryBehavior: IGeometryBehavior = {
  titleChange: useEntityTitleChange,
  colorChange: useEntityColorChange,
  setEdge: useEdge,
  setLocations: useContentSetLocations,
};
