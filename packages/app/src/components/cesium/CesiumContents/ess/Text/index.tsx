import { Cartesian3, Entity } from 'cesium';
import { FC, memo, useContext, useEffect, useState } from 'react';

import { UseState, useContent, UseL10n, useL10n } from '^/hooks';
import * as T from '^/types';

import { ITextBehavior } from '^/components/cesium/CesiumBehaviors/ess/text';
import { CesiumContext, CesiumContextProps } from '^/components/cesium/CesiumContext';
import { makeCesiumId, makeCesiumType } from '^/components/cesium/cesium-util';
import { createCesiumESSTextOptions, createCesiumTextItemDefaultPointOptions } from '^/components/cesium/styles';
import { CesiumContentProps } from '^/components/cesium/CesiumContents/PropTypes/props';
import { DEFAULT_ESS_TEXT_PROMPT } from '^/constants/defaultContent';
type Props = CesiumContentProps<T.ESSTextContent, ITextBehavior>;

export const CesiumESSText: FC<Props> = memo(({ contentId, behavior }) => {
  const { viewer, interaction }: CesiumContextProps = useContext(CesiumContext);
  const content: T.ESSTextContent | undefined = useContent(contentId, (prev, next) => (
    prev?.color.toString() === next?.color.toString() &&
      prev?.info.location.toString() === next?.info.location.toString() &&
      prev?.info.description === next?.info.description &&
      prev?.info.fontSize === next?.info.fontSize &&
      prev?.info.fontColor.toString() === next?.info.fontColor.toString()
  ));
  const [, setEntity]: UseState<Entity | undefined> = useState();
  const [l10n]: UseL10n = useL10n();

  useEffect(() => {
    if (viewer === undefined || viewer.isDestroyed() || !interaction || !content) return;

    const { color, type, info }: T.ESSTextContent = content;

    const contentEntity: Entity = viewer.entities.add({
      position: Cartesian3.fromDegrees(info.location[0], info.location[1]),
      billboard: createCesiumTextItemDefaultPointOptions({ color }),
      id: makeCesiumId(contentId),
      name: makeCesiumType(type),
      label: createCesiumESSTextOptions({
        text: info.description ? info.description : l10n(DEFAULT_ESS_TEXT_PROMPT),
        bgColor: color,
        fontColor: info.fontColor,
        fontSize: info.fontSize,
      }),
      show: !interaction.isCreating,
    });

    viewer.scene.requestRender();

    return () => {
      if (viewer.isDestroyed()) return;

      viewer.entities.remove(contentEntity);
      viewer.scene.requestRender();

      setEntity(undefined);
    };
  }, [viewer, interaction, content]);

  behavior.pinPointer(content);

  return null;
});
