import _ from 'lodash-es';
import React, { Dispatch as LocalDispatch, FC, Fragment, ReactNode, useCallback } from 'react';
import { useSelector } from 'react-redux';

import olWrap, { OlProps } from '^/components/atoms/OlWrap';
import route from '^/constants/routes';
import { useRole, useRouteIsMatching } from '^/hooks';
import * as T from '^/types';
import { isRoleViewer } from '^/utilities/role-permission-check';
import { LengthSegmentsOverlay } from '../OlLengthSegmentOverlays';
import { OlMeasurementBoxLayer } from '../OlMeasurementBoxLayer';
import ClickEventGeneratorFromSidebar from './OlClickEventGeneratorFromSidebar';
import DrawEventListener from './OlDrawEventListener';
import ModifyEventListener from './OlModifyEventListener';
import PointerMoveEventListener from './OlPointerMoveEventListener';
import { Actions } from './store/Actions';
import { OlEventListenerState } from './store/State';

export interface OlRegisterMapEventListenersProps {
  olEventListenerState: OlEventListenerState;
  localDispatchRaw: LocalDispatch<Actions>;
}
const RawOlRegisterMapEventListeners: FC<OlProps<OlRegisterMapEventListenersProps>> = ({
  map, layerGroup, olEventListenerState, localDispatchRaw,
}) => {
  const {
    Pages: { Contents: { currentContentTypeFromAnnotationPicker } },
  }: T.State = useSelector((state: T.State) => state);
  const role: T.PermissionRole = useRole();
  const localDispatch: LocalDispatch<Actions> = useCallback(localDispatchRaw, []);

  const isOnSharePage: boolean = useRouteIsMatching(route.share.main);
  const isViewer: boolean = isRoleViewer(role);

  const listeners: ReactNode = isViewer || isOnSharePage ? (
    <PointerMoveEventListener
      map={map}
      localDispatch={localDispatch}
      olEventListenerState={olEventListenerState}
    />
  ) : (
    <>
      <PointerMoveEventListener
        map={map}
        localDispatch={localDispatch}
        olEventListenerState={olEventListenerState}
      />
      <DrawEventListener
        localDispatch={localDispatch}
        map={map}
        layerGroup={layerGroup}
      />
      <ModifyEventListener
        currentContentTypeFromAnnotationPicker={currentContentTypeFromAnnotationPicker}
        map={map}
        layerGroup={layerGroup}
        localDispatch={localDispatch}
        isDrawing={olEventListenerState.isDrawing}
      />
      <ClickEventGeneratorFromSidebar map={map} />
    </>
  );

  return (
    <Fragment>
      {listeners}
      <LengthSegmentsOverlay
        olMap={map}
        {...{
          olEventListenerState,
          currentContentTypeFromAnnotationPicker,
          localDispatch,
        }}
      />
      <OlMeasurementBoxLayer
        olMap={map}
        olEventListenerState={olEventListenerState}
      />
    </Fragment>
  );
};

export const OlRegisterMapEventListeners: FC<OlRegisterMapEventListenersProps> = olWrap(RawOlRegisterMapEventListeners);

