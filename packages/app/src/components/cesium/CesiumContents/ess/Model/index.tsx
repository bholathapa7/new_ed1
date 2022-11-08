import {
  Cartesian3,
  ConstantProperty,
  Entity,
  HeightReference,
  Ellipsoid,
  VerticalOrigin,
  NearFarScalar,
} from 'cesium';
import React, { FC, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { CesiumContext, CesiumContextProps } from '^/components/cesium/CesiumContext';

import { UseState, useContent } from '^/hooks';
import * as T from '^/types';
import { IModelBehavior } from '../../../CesiumBehaviors/ess/model';
import { getMeshOrTerrainPosition, makeCesiumId, makeCesiumType, parseLastNumberFrom, getCesiumColor } from '../../../cesium-util';
import { CesiumContentProps } from '../../PropTypes/props';
import {
  ESS_INNER_CIRCLE_SIZE_MEDIUM,
  ESS_INNER_CIRCLE_SIZE_SMALL,
  ESS_INNER_CIRCLE_SIZE_THRESHOLD,
  ESS_INNER_CIRCLE_WIDTH,
  ESS_INNER_CIRCLE_WIDTH_LAST,
  ESS_MODEL_WORK_RADIUS_LABEL,
  ESS_MODEL_WORK_RADIUS_RADIUS,
} from '^/constants/cesium';
import dsPalette from '^/constants/ds-palette';
import { commonConstants } from '^/constants/map-display';
import { calculateDistance, determineUnitType } from '^/utilities/imperial-unit';
import { getImperialMeasurementUnitFromGeometryType, getMeasurementUnitFromGeometryType } from '^/components/ol/contentTypeSwitch';

interface ModelProperties {
  readonly initialHeading: ConstantProperty;
  readonly heading: ConstantProperty;
  readonly workRadius: ConstantProperty;
  readonly boundingSphere?: ConstantProperty;
}

type Props = CesiumContentProps<T.ESSModelContent, IModelBehavior>;

export const CesiumESSModel: FC<Props> = ({ contentId, behavior }) => {
  const { viewer, interaction }: CesiumContextProps = useContext(CesiumContext);
  const [entity, setEntity]: UseState<Entity | undefined> = useState();
  const [subEntities, setSubEntities]: UseState<Entity[] | undefined> = useState();
  const content: T.ESSModelContent | undefined = useContent(contentId, (prev, next) => (
    prev?.info.location.toString() === next?.info.location.toString() &&
      prev?.info.heading === next?.info.heading &&
      prev?.info.isWorkRadiusVisEnabled === next?.info.isWorkRadiusVisEnabled
  ));
  const {
    projectId,
    projectById,
  } = useSelector((s: T.State) => ({
    projectById: s.Projects.projects.byId,
    projectId: s.Pages.Contents.projectId,
  }));

  if (projectId === undefined) throw new Error('No Project Id in Pages.Contents.projectId');

  const unitType: T.ValidUnitType = determineUnitType(projectById[projectId].unit);
  const radiusUnit = unitType === T.UnitType.IMPERIAL ? getImperialMeasurementUnitFromGeometryType({ geometryType: T.ContentType.LENGTH })
    : getMeasurementUnitFromGeometryType({ geometryType: T.ContentType.LENGTH });

  const isOnWorkRadius: boolean = useSelector((s: T.State) => s.Pages.Contents.isOnWorkRadius);
  const model: T.ESSModelInstance | undefined = useSelector((s: T.State) => {
    if (!content) return undefined;

    return s.ESSModels.byId?.[content.info.modelId];
  });

  const clearSubEntities = () => {
    if (!subEntities || !viewer) return;

    subEntities.forEach((subEntity) => {
      viewer.entities.remove(subEntity);
    });

    setSubEntities(undefined);
    viewer.scene.requestRender();
  };

  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed() || !content || !interaction || !model) return;

    const properties: ModelProperties = {
      // Heading from the DB is in degrees, converting it to radians.
      // eslint-disable-next-line no-magic-numbers
      initialHeading: new ConstantProperty((model?.heading ?? 0) * Math.PI / 180),
      heading: new ConstantProperty(content.info.heading ?? 0),
      workRadius: new ConstantProperty(
        content.info.isWorkRadiusVisEnabled ? model.workRadius ?? 0 : 0
      ),
    };

    const modelEntity: Entity = viewer.entities.add({
      id: makeCesiumId(contentId),
      name: makeCesiumType(content.type),
      model: {
        uri: model?.url,
        scale: model?.scale,
        // When first created, clamp model to ground
        // because it needs to get the immediate position
        // before clamping it to mesh (if any);
        // the mesh might not be loaded yet.
        heightReference: HeightReference.CLAMP_TO_GROUND,
      },
      properties,
    });

    setEntity(modelEntity);

    viewer.scene.requestRender();

    return () => {
      if (viewer?.isDestroyed()) return;

      viewer.entities.remove(modelEntity);
      viewer.scene.requestRender();

      setEntity(undefined);
    };
  }, [!content, !model, interaction]);

  useEffect(() => {
    if (!entity?.properties || !model?.workRadius || !viewer) return;

    const isWorkRadiusActivated: boolean =
      isOnWorkRadius ||
      (interaction?.selectedEntity?.id === entity.id) ||
      (content?.info.isWorkRadiusVisEnabled ?? false);

    entity.properties.workRadius = new ConstantProperty(
      isWorkRadiusActivated ? (model.workRadius ?? 0) : 0,
    );

    if (isWorkRadiusActivated) {
      if (subEntities) return;

      const baseEntities = [];

      const workRadius = entity.properties.workRadius._value;
      const innerCircleSizeRadius = (() => {
        if (workRadius === 0) return 0;

        return Math.max(
          workRadius < ESS_INNER_CIRCLE_SIZE_THRESHOLD
            ? ESS_INNER_CIRCLE_SIZE_SMALL
            : ESS_INNER_CIRCLE_SIZE_MEDIUM,

          ESS_INNER_CIRCLE_SIZE_SMALL,
        );
      })();
      if (!content?.info.location) return;
      const entityLocation = getMeshOrTerrainPosition(Cartesian3.fromDegrees(content?.info.location[0], content?.info.location[1]), entity, viewer);

      const id = parseLastNumberFrom(entity.id);

      const maxInnerCircleCount = Math.ceil(workRadius / innerCircleSizeRadius) + 1;
      let innerCircleCount = maxInnerCircleCount;

      while (--innerCircleCount) {
        const radius: number = Math.min(workRadius, innerCircleCount * innerCircleSizeRadius);

        baseEntities.push(viewer.entities.add({
          id: `${makeCesiumId(id)}-circle-${innerCircleCount}`,
          name: ESS_MODEL_WORK_RADIUS_RADIUS,
          position: entityLocation,
          ellipse: {
            semiMajorAxis: radius,
            semiMinorAxis: radius,
            outline: true,
            outlineColor: getCesiumColor(dsPalette.themePrimaryLighter),
            outlineWidth: innerCircleCount === maxInnerCircleCount - 1 ? ESS_INNER_CIRCLE_WIDTH_LAST : ESS_INNER_CIRCLE_WIDTH,
            fill: false,
            // Put the height at 0 because according to Cesium docs,
            // outline can only be shown when height is defined.
            // The height actually isn't really used since the ellipse
            // is being clamped on the ground.
            height: 0,
            heightReference: HeightReference.CLAMP_TO_GROUND,
          },
        }));

        // Place the distance label for every radius to the east of the circle.
        // https://community.cesium.com/t/latitude-longitude-to-east-north/11083/2
        const modelCenter = getMeshOrTerrainPosition(entityLocation, entity, viewer);
        const normal = Ellipsoid.WGS84.geodeticSurfaceNormal(modelCenter);
        const east = Cartesian3.cross(Cartesian3.UNIT_Z, normal, new Cartesian3());
        const normalizedEast = Cartesian3.normalize(east, new Cartesian3());
        const labelOffset = Cartesian3.multiplyByScalar(normalizedEast, radius, new Cartesian3());
        const labelPosition = Cartesian3.add(entityLocation, labelOffset, new Cartesian3());

        baseEntities.push(viewer.entities.add({
          id: `${makeCesiumId(id)}-circle-label-${innerCircleCount}`,
          name: ESS_MODEL_WORK_RADIUS_LABEL,
          position: labelPosition,
          label: {
            text: `${calculateDistance(radius, unitType).toFixed(0)} ${radiusUnit}`,
            font: commonConstants.labelFontStyle,
            verticalOrigin: VerticalOrigin.BOTTOM,
            disableDepthTestDistance: Infinity,
            // eslint-disable-next-line no-magic-numbers
            scaleByDistance: new NearFarScalar(1, 3, 500, 0.1),
          },
        }));
      }

      setSubEntities(baseEntities);

      viewer.scene.requestRender();
    } else {
      clearSubEntities();
    }
  }, [entity, interaction?.selectedEntity?.id, content?.info.isWorkRadiusVisEnabled, isOnWorkRadius, subEntities]);

  useEffect(() => {
    clearSubEntities();
  }, [content?.info.location]);

  useEffect(() => clearSubEntities, [subEntities]);

  behavior.setLocation(content, entity);

  return (<></>);
};
