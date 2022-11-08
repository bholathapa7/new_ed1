import { Entity } from 'cesium';

import * as T from '^/types';
import { useESSModelSetLocation } from '../../CesiumHooks';

export interface IModelBehavior {
  setLocation(content?: T.ESSModelContent, entity?: Entity): void;
}

export const ModelBehavior: IModelBehavior = {
  setLocation: useESSModelSetLocation,
};
