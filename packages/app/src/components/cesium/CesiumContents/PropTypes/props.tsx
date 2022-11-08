import { IGeometryBehavior } from '^/components/cesium/CesiumBehaviors/contents';
import { IModelBehavior } from '^/components/cesium/CesiumBehaviors/ess/model';
import { ITextBehavior } from '^/components/cesium/CesiumBehaviors/ess/text';
import { IMarkerBehavior } from '^/components/cesium/CesiumBehaviors/marker';
import { IOverlayBehavior } from '^/components/cesium/CesiumBehaviors/overlays';
import * as T from '^/types';

export interface CesiumContentProps<
  Content extends T.Content,
  Behavior extends IGeometryBehavior | IMarkerBehavior | IOverlayBehavior | IModelBehavior | ITextBehavior,
> {
  readonly contentId: Content['id'];
  readonly behavior: Behavior;
}
