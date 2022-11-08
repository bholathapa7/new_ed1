import * as T from '^/types';
import { useEntityTitleChange } from '../../CesiumHooks';

export interface IOverlayBehavior {
  titleChange(content: T.OverLayContent): void;
}

export const OverlayBehavior: IOverlayBehavior = {
  titleChange: useEntityTitleChange,
};
