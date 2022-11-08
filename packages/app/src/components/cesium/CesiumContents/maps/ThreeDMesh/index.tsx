import { Cesium3DTileStyle, Cesium3DTileset, Math as CesiumMath, Rectangle } from 'cesium';
import React, { FC, memo, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { CesiumContext, CesiumContextProps } from '^/components/cesium/CesiumContext';
import { DEFAULT_OPACITY } from '^/constants/defaultContent';
import { CesiumPrimitivesIndex } from '^/constants/map-display';
import palette from '^/constants/palette';
import { typeGuardThreeDMesh } from '^/hooks';
import { makeS3URL } from '^/store/duck/API';
import * as T from '^/types';

export interface Props {
  readonly contentId: T.ThreeDMeshContent['id'];
}

export const Cesium3DMesh: FC<Props> = memo(({
  contentId,
}) => {
  const { viewer }: CesiumContextProps = useContext(CesiumContext);
  const content: T.ThreeDMeshContent | undefined = useSelector((state: T.State) => typeGuardThreeDMesh(state.Contents.contents.byId[contentId]));

  if (content === undefined) {
    throw new Error('Should have given 3D Mesh contentId');
  }

  const opacity: T.ThreeDMeshConfigPerUser['opacity'] = content.config?.opacity !== undefined ? content.config.opacity : DEFAULT_OPACITY;

  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed()) return;

    const tileset: Cesium3DTileset = viewer.scene.primitives.add(new Cesium3DTileset({
      url: makeS3URL(contentId, 'tiled_model', 'tileset.json'),
      maximumScreenSpaceError: 2,
      skipLevelOfDetail: true,
      dynamicScreenSpaceError: true,
      dynamicScreenSpaceErrorDensity : 0.00278,
      dynamicScreenSpaceErrorFactor : 4,
      dynamicScreenSpaceErrorHeightFalloff : 0.25,
    }), CesiumPrimitivesIndex.THREE_D_MESH);
    viewer.scene.requestRender();

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    tileset.readyPromise.then(() => {
      if (tileset.properties.Height.minimum > 0) return;

      viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
      const west: number = CesiumMath.toDegrees(tileset.properties.Longitude.minimum);
      const east: number = CesiumMath.toDegrees(tileset.properties.Longitude.maximum);
      const north: number = CesiumMath.toDegrees(tileset.properties.Latitude.maximum);
      const south: number = CesiumMath.toDegrees(tileset.properties.Latitude.minimum);

      viewer.scene.globe.translucency.enabled = true;
      viewer.scene.globe.translucency.frontFaceAlpha = 0;
      viewer.scene.globe.translucency.rectangle = Rectangle.fromDegrees(west, south, east, north);
    });

    return () => {
      if (viewer.isDestroyed()) return;

      viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
      viewer.scene.globe.translucency.enabled = false;
      viewer.scene.primitives.remove(tileset);
      viewer.scene.requestRender();
    };
  }, [viewer]);

  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed()) return;

    const tileset: Cesium3DTileset | undefined = (viewer?.scene.primitives.get(CesiumPrimitivesIndex.THREE_D_MESH) as Cesium3DTileset | undefined);

    if (tileset === undefined) return;

    // eslint-disable-next-line no-magic-numbers
    const fixedOpacity: number = Number((opacity / 100).toFixed(2));

    tileset.style = new Cesium3DTileStyle({
      color: palette.white.alpha(fixedOpacity).toString(),
    });

    viewer.scene.requestRender();
  }, [opacity]);

  return <></>;
});
