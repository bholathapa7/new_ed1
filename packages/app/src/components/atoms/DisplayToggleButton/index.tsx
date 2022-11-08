import React, { FC, memo, useCallback } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';
import { Action, Dispatch } from 'redux';
import styled from 'styled-components';

import * as T from '^/types';
import Text from './text';

import palette from '^/constants/palette';
import { FontFamily } from '^/constants/styles';

import RawToggleButton, { Props as ToggleButtonProps } from '^/components/atoms/ToggleButton';

import { PatchContent } from '^/store/duck/Contents';
import { ChangeContentsSidebarTab, ChangeIn3D, ChangeIn3DPointCloud, SetPreventAutoSelect } from '^/store/duck/Pages';

import { CANCELLABLE_CLASS_NAME } from '^/components/molecules/CreatingVolumeClickEventHandler';
import { UseL10n, typeGuardMeasurementContent, useL10n } from '^/hooks';
import { getSingleContentId } from '^/utilities/state-util';
import { withFeatureToggle } from '^/utilities/withFeatureToggle';

export const twoDToThreeDToggleButtonId: string = '2d-3d-toggle-button';

export const ToggleButton = styled(RawToggleButton)<ToggleButtonProps>({
  boxShadow: palette.insideMap.shadow,
  width: 60,
  height: 26,
});

export const spanCustomStyle: ToggleButtonProps['spanCustomStyle'] = {
  fontFamily: FontFamily.ROBOTO,
  fontWeight: 'bold',
};

const DisplayToggleButton: FC = () => {
  const dispatch: Dispatch = useDispatch();

  const isIn3D: T.ContentsPageState['in3D'] = useSelector((s: T.State) => s.Pages.Contents.in3D);
  const isThreeDOrthoAvailableOnCurrentDate: boolean = useSelector(
    ({ Contents, Pages, ProjectConfigPerUser }: T.State) =>
      getSingleContentId(Contents, Pages, ProjectConfigPerUser, T.ContentType.THREE_D_ORTHO) !== undefined
  );

  // Do not toggle to the map tab if it's currently editing the measurement.
  // This is so that user could compare the measurements between 2D and 3D easily.
  const isCurrentlyEditingMeasurement: boolean = useSelector((state: T.State) => {
    const contentId: T.MeasurementContent['id'] | undefined = state.Pages.Contents.editingContentId;
    const isViewingMeasurementsTab: boolean = state.Pages.Contents.sidebarTab === T.ContentPageTabType.MEASUREMENT;

    return isViewingMeasurementsTab
      && contentId !== undefined
      && !!typeGuardMeasurementContent(state.Contents.contents.byId[contentId]);
  });

  const twoDMapId: T.MapContent['id'] | undefined = useSelector((state: T.State) => getSingleContentId(
    state.Contents, state.Pages, state.ProjectConfigPerUser, T.ContentType.MAP,
  ));

  const threeDMapId: T.MapContent['id'] | undefined = useSelector((state: T.State) => getSingleContentId(
    state.Contents, state.Pages, state.ProjectConfigPerUser, T.ContentType.THREE_D_ORTHO,
  ));

  const [l10n]: UseL10n = useL10n();

  const on3DToggle: () => void = useCallback(() => {
    const actions: Action[] = [];
    if (isThreeDOrthoAvailableOnCurrentDate || isIn3D) actions.push(ChangeIn3DPointCloud({ in3DPointCloud: false }));

    actions.push(
      ChangeIn3D({ in3D: !isIn3D }),
      SetPreventAutoSelect({ value: false }),
    );

    if (isCurrentlyEditingMeasurement) {
      // TODO: This is a patch to fix an issue when selecting a measurement
      // then toggles the 2D/3D, the map content isn't being selected.
      // The actual issue is in the logic of toggling the contents in the contentlist* components.
      // Will be fixed in https://angelswing.atlassian.net/browse/DFE-1192.
      if (!twoDMapId || !threeDMapId) return;

      actions.push(PatchContent({
        content: {
          id: isIn3D ? twoDMapId : threeDMapId,
          config: {
            selectedAt: new Date(),
          },
        },
      }));
    } else {
      actions.push(ChangeContentsSidebarTab({ sidebarTab: T.ContentPageTabType.MAP }));
    }

    batch(() => {
      actions.forEach(dispatch);
    });
  }, [isCurrentlyEditingMeasurement, isThreeDOrthoAvailableOnCurrentDate, isIn3D, twoDMapId, threeDMapId]);

  return (
    <ToggleButton
      htmlId={twoDToThreeDToggleButtonId}
      className={CANCELLABLE_CLASS_NAME}
      isRight={isIn3D}
      leftText='2D'
      rightText='3D'
      leftTextTooltip={l10n(Text.tooltipToggleLeftText)}
      rightTextTooltip={l10n(Text.tooltipToggleRightText)}
      spanCustomStyle={spanCustomStyle}
      trackLabel={`btn-toggle-display-${isIn3D ? '2d' : '3d-ortho'}`}
      trackAction='map-view'
      onChange={on3DToggle}
    />
  );
};

export default memo(withFeatureToggle(T.Feature.DDM)(DisplayToggleButton));
