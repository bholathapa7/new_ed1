import {
  ImageryLayer,
  Math as CesiumMath,
  Rectangle,
  UrlTemplateImageryProvider,
} from 'cesium';
import React, { FC, useContext, useEffect, useRef, MutableRefObject } from 'react';
import { useSelector } from 'react-redux';

import { IOverlayBehavior } from '^/components/cesium/CesiumBehaviors/overlays';
import { typeGuardBlueprintDXF } from '^/hooks';
import { makeS3URL } from '^/store/duck/API';
import * as T from '^/types';
import { withFeatureToggle } from '^/utilities/withFeatureToggle';
import { CesiumContext, CesiumContextProps } from '../../../CesiumContext';
import { CesiumContentProps } from '../../PropTypes/props';

// As per BE request, the max zoom level is capped at 22.
const MIN_ZOOM_LEVEL: number = 2;
const MAX_ZOOM_LEVEL: number = 22;

type Props = CesiumContentProps<T.BlueprintDXFContent, IOverlayBehavior>;
type Bounds = NonNullable<NonNullable<T.BlueprintDXFContent['info']['tms']>['bounds']>;

/**
 * Component for Cesium Blueprint layer.
 * This component has similar concept as ImageryLayer.
 * For now, this only works for DXF, but it can be expanded
 * to also support similar overlays like PDF.
 */
const RawCesiumBlueprint: FC<Props> = ({ contentId }) => {
  const { viewer }: CesiumContextProps = useContext(CesiumContext);
  const imageLayer: MutableRefObject<ImageryLayer | undefined> = useRef();

  const contentOpacity: number | undefined =
    useSelector(({ Contents }) => Contents.contents.byId[contentId]?.config?.opacity);

  // To set the proper bounds for the overlay
  // so that it only requests the image within the overlay bounds,
  // get the correct rectangle bound for the current overlay
  // and pass it to the image provider.
  const contentRectangle: Rectangle =
    useSelector(({ Contents }) => {
      const content: T.BlueprintDXFContent | undefined = typeGuardBlueprintDXF(Contents.contents.byId[contentId]);
      const boundary: Bounds | undefined = content?.info?.tms?.bounds;
      if (!content || !boundary) return Rectangle.MAX_VALUE;

      return new Rectangle(...boundary.map(CesiumMath.toRadians) as Bounds);
    });

  useEffect(() => {
    if (imageLayer.current === undefined || contentOpacity === undefined || viewer === undefined || viewer.isDestroyed()) return;

    // eslint-disable-next-line no-magic-numbers
    imageLayer.current.alpha = contentOpacity / 100;
    viewer.scene.requestRender();
  }, [viewer, contentOpacity]);

  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed()) return;

    const provider: UrlTemplateImageryProvider = new UrlTemplateImageryProvider({
      // Use reverseY so that it could match with BE's tiling logic for Y coordinate.
      url: `${makeS3URL(contentId, 'raster_tiles')}/{z}/{x}/{reverseY}@2x.png`,
      minimumLevel: MIN_ZOOM_LEVEL,
      maximumLevel: MAX_ZOOM_LEVEL,
      rectangle: contentRectangle,
    });

    imageLayer.current = viewer.imageryLayers.addImageryProvider(provider);

    return () => {
      if (imageLayer.current === undefined || viewer.isDestroyed()) return;

      viewer?.imageryLayers.remove(imageLayer.current);
      imageLayer.current = undefined;
    };
  }, [viewer, contentId]);

  return (<></>);
};

export const CesiumBlueprint = withFeatureToggle<Props>(T.Feature.DDM)(RawCesiumBlueprint);
