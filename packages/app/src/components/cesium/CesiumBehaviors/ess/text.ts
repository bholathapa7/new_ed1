import { Entity } from 'cesium';

import * as T from '^/types';
import { usePinpointer } from '../../CesiumHooks';

export interface ITextBehavior {
  setLocation(content?: T.ESSTextContent, entity?: Entity): void;
  pinPointer(content?: T.ESSTextContent): void;
}

export const TextBehavior: ITextBehavior = {
  setLocation: () => undefined,
  pinPointer: usePinpointer,
};
