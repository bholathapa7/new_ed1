import * as Sentry from '@sentry/browser';
import _ from 'lodash-es';
import React, { FC, useEffect } from 'react';

import { useProjectCoordinateSystem } from '^/hooks/useProjectCoordinateSystem';
import { contentsSelector } from '^/store/duck/Contents';
import * as T from '^/types';
import { getLayerById } from '^/utilities/ol-layer-util';
import { MapBrowserEvent } from 'ol';
import OlMap from 'ol/Map';
import { Geometry } from 'ol/geom';
import { Pixel } from 'ol/pixel';
import { useSelector } from 'react-redux';
import { INTERVAL, InteractionEventTypes, OlCustomPropertyNames } from '../constants';
import { createGeometryFromLocations, getOverlayPositionFromGeometryType } from '../contentTypeSwitch';

export interface CustomClickEvent {
  isBlankSpaceClick: boolean;
  contentId?: T.Content['id'];
}

interface Props {
  map: OlMap;
}

const OlClickEventGeneratorFromSidebar: FC<Props> = ({
  map,
}) => {
  const {
    Contents, Pages: { Contents: { isMeasurementClickedFromMap, editingContentId } },
    ProjectConfigPerUser,
  }: T.State = useSelector((state: T.State) => state);
  const isSelected: boolean = contentsSelector.isSelected(Contents, ProjectConfigPerUser)(editingContentId);
  const projectProjection: T.ProjectionEnum = useProjectCoordinateSystem();

  useEffect(() => {
    try {
      if (!editingContentId || !isSelected) {
        exitEditMode();

        return;
      }

      if (isMeasurementClickedFromMap) return;

      const editingContent: T.MeasurementContent = Contents.contents.byId[editingContentId] as T.MeasurementContent;
      if (!T.MeasurementContentTypes.includes(editingContent.type)) return;

      enterEditModeFor(editingContent);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      Sentry.captureException(e);
    }
  }, [editingContentId, isSelected]);

  function exitEditMode(): void {
    sendClickEvent(OlCustomPropertyNames.EXIT_EDIT);
  }

  function enterEditModeFor(editingContent: T.MeasurementContent): void {
    if (editingContentId === undefined) throw new Error('Should exit edit mode when editing Content id is undefined');
    // eslint-disable-next-line max-len
    const locations: Array<T.GeoPoint> = editingContent.type === T.ContentType.MARKER ? [editingContent.info.location] : editingContent.info.locations;
    const geometry: Geometry = createGeometryFromLocations({ locations, geometryType: editingContent.type, projectProjection });

    const id: number = window.setInterval(() => {
      try {
        const pixel: Pixel = map.getPixelFromCoordinate(getOverlayPositionFromGeometryType({ geometry, geometryType: editingContent.type }));
        const isPixelDetectable: boolean = map.getFeaturesAtPixel(pixel).length > 0;
        const isLayerReady: boolean = getLayerById({ olMap: map, id: editingContentId }) !== undefined;
        if (isLayerReady && isPixelDetectable) {
          clearInterval(id);
          sendClickEvent(OlCustomPropertyNames.ENTER_EDIT, pixel);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        clearInterval(id);
      }
    }, INTERVAL);
  }

  function sendClickEvent(customEvent: OlCustomPropertyNames.ENTER_EDIT | OlCustomPropertyNames.EXIT_EDIT, pixel?: Pixel): void {
    const evt: MapBrowserEvent | CustomClickEvent = {
      type: InteractionEventTypes.CLICK,
      contentId: editingContentId,
      isBlankSpaceClick: customEvent === OlCustomPropertyNames.EXIT_EDIT,
      pixel: customEvent === OlCustomPropertyNames.EXIT_EDIT ? [] : pixel,
    };
    // @ts-ignore
    map.dispatchEvent(evt);
  }

  return <></>;
};

export default OlClickEventGeneratorFromSidebar;
