import {
  Cartesian3,
  Entity,
  PolygonGraphics, PolylineGraphics, PolylineArrowMaterialProperty,
} from 'cesium';
import { FC, useContext, useEffect, useState } from 'react';

import { UseState, useContent } from '^/hooks';
import * as T from '^/types';

import { IGeometryBehavior } from '^/components/cesium/CesiumBehaviors/contents';
import { CesiumContext, CesiumContextProps } from '^/components/cesium/CesiumContext';
import { getCesiumColor, makeCesiumId, makeCesiumType } from '^/components/cesium/cesium-util';
import { ESS_POLYLINE_WIDTH, ESS_ARROW_LINE_WIDTH, createCesiumPolylineOptions, createCesiumPolygonOptions } from '^/components/cesium/styles';
import { CesiumContentProps } from '^/components/cesium/CesiumContents/PropTypes/props';
import { exhaustiveCheck } from '^/utilities/exhaustive-check';

type Props = CesiumContentProps<T.ESSLineBasedContent, IGeometryBehavior>;

export const CesiumESSPolyline: FC<Props> = ({ contentId, behavior }) => {
  const { viewer, interaction }: CesiumContextProps = useContext(CesiumContext);
  const content: T.ESSLineBasedContent | undefined = useContent(contentId, (prev, next) => (
    prev?.info.locations.toString() === next?.info.locations.toString() &&
      prev?.color.toString() === next?.color.toString()
  ));
  const [entity, setEntity]: UseState<Entity | undefined> = useState();

  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed() || !interaction || !content) return;

    const { type, color, info: { locations } }: T.ESSLineBasedContent = content;

    const customPolylineOptions: PolylineGraphics.ConstructorOptions = (() => {
      switch (type) {
        case T.ContentType.ESS_ARROW: {
          return {
            width: ESS_ARROW_LINE_WIDTH,
            material: new PolylineArrowMaterialProperty(getCesiumColor(color)),
          };
        }
        case T.ContentType.ESS_POLYGON:
        case T.ContentType.ESS_POLYLINE: {
          return {
            width: ESS_POLYLINE_WIDTH,
          };
        }
        default: {
          exhaustiveCheck(type);
        }
      }
    })();

    const customPolygonOptions: PolygonGraphics.ConstructorOptions | undefined = (() => {
      switch (type) {
        case T.ContentType.ESS_POLYGON: {
          return createCesiumPolygonOptions({ color, locations });
        }
        default: {
          return undefined;
        }
      }
    })();

    const contentEntity: Entity = viewer.entities.add({
      position: Cartesian3.fromDegrees(locations[0][0], locations[0][1]),
      polyline: {
        ...createCesiumPolylineOptions({ color, locations }),
        ...customPolylineOptions,
      },
      polygon: customPolygonOptions,
      id: makeCesiumId(contentId),
      name: makeCesiumType(content.type),
    });

    setEntity(contentEntity);

    viewer.scene.requestRender();

    return () => {
      if (viewer.isDestroyed()) return;

      viewer.entities.remove(contentEntity);
      viewer.scene.requestRender();

      setEntity(undefined);
    };
  }, [viewer, interaction, content !== undefined]);

  behavior.colorChange(content);
  behavior.setLocations(content, entity);

  return null;
};
