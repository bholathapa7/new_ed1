import React, { FC, ReactNode } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import { ConfirmButton } from '^/components/atoms/Buttons';
import Popup from '^/components/molecules/Popup';
import dsPalette from '^/constants/ds-palette';
import { UseL10n, UseLastSelectedScreen, useL10n, useLastSelectedScreen, typeGuardGroup } from '^/hooks';
import { DeleteContent } from '^/store/duck/Contents';
import { DeleteESSContent } from '^/store/duck/ESSContents';
import { AddNewGroup } from '^/store/duck/Groups';
import { isContentPinned } from '^/utilities/content-util';
import { CloseContentPagePopup } from '^/store/duck/Pages/Content';
import * as T from '^/types';
import { changeWordsOrderOnLang } from '^/utilities/l10n';
import Text from './text';
import { groupName } from '^/constants/group';

const Root = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '313px',
  padding: '31px 50px 35px 50px',
});

const Description = styled.h2({
  display: 'block',
  width: '100%',

  marginBottom: '33px',
  lineHeight: '24px',
  fontSize: '16px',
  fontWeight: 'normal',
  overflowWrap: 'break-word',
  color: dsPalette.title.toString(),
});


export interface Props {
  readonly zIndex: number;
}

const backgroundAlpha: number = 0.45;

export const DeleteGroupPopup: FC<Props> = ({ zIndex }) => {
  const sidebarTab = useSelector((s: T.State) => s.Pages.Contents.sidebarTab);
  const selectedGroupId = useSelector((s: T.State) => s.Groups.selectedGroupIdByTab[sidebarTab]);
  const childrenIds = useSelector((s: T.State) => selectedGroupId ? s.Groups.tree.idsByGroup[selectedGroupId] : []);
  const group: T.GroupContent | undefined = useSelector((s: T.State) => typeGuardGroup(s.Contents.contents.byId[selectedGroupId ?? NaN]));
  const children = useSelector((s: T.State) => childrenIds.map((childId) => s.Contents.contents.byId[childId]))
    .filter((child) => child !== undefined);
  const selectedChildren = children.filter((child: T.Content) => child.config?.selectedAt);
  const noChildrenSelected = selectedChildren.length === 0;
  const hasAllChildrenSelected = !noChildrenSelected && selectedChildren.length === children.length;
  const isPartiallyChecked = !noChildrenSelected && selectedChildren.length < children.length;
  const isChecked = (children.length === 0 && Boolean(group?.config?.selectedAt)) || hasAllChildrenSelected;

  const groupsByCategory: Array<T.Content['id']> = useSelector((s: T.State) => {
    if (group === undefined) {
      return [];
    }

    const { pinned, unpinned } = s.Groups.tree.rootIdsByCategory[group.category];

    return group.screenId === undefined
      ? pinned
      : unpinned[group.screenId] ?? [];
  });

  const [l10n, lang]: UseL10n = useL10n();
  const dispatch: Dispatch = useDispatch();

  const lastSelectedScreen: UseLastSelectedScreen = useLastSelectedScreen();
  const warningType: T.ContentPagePopupType = T.ContentPagePopupType.DELETE_GROUP;
  if (lastSelectedScreen === undefined) return null;

  const onClose: () => void = () => {
    dispatch(CloseContentPagePopup());
  };

  const handleConfirm: () => void = () => {
    if (selectedGroupId !== undefined) {
      batch(() => {
        if (sidebarTab === T.ContentPageTabType.ESS) {
          if (isPartiallyChecked) {
            selectedChildren.forEach(({ id }) => {
              dispatch(DeleteESSContent({ id }));
            });
          }
          if (isChecked) {
            dispatch(DeleteESSContent({ id: selectedGroupId }));
          }
        } else {
          if (isPartiallyChecked) {
            selectedChildren.forEach(({ id }) => {
              dispatch(DeleteContent({ contentId: id }));
            });
          }
          if (isChecked) {
            dispatch(DeleteContent({ contentId: selectedGroupId }));
          }
        }

        // Recreate empty group to the list
        // since the code assumes that there should be at least one group.
        if (group !== undefined && groupsByCategory.length === 1 && isChecked) {
          dispatch(
            AddNewGroup({
              isPinned: isContentPinned(group),
              skipTriggerRename: true,
              customTitle: groupName[lang],
            })
          );
        }

        // Technically the popup should only close when everything is deleted,
        // but for now this should work.
        dispatch(CloseContentPagePopup());
      });
    }
  };

  const PopupDescription: ReactNode = (
    <Description>
      {changeWordsOrderOnLang(`"${group?.title}"`, l10n(Text.description.first), lang)}
      <br />
      {l10n(Text.description.second)}
    </Description>
  );
  const buttonText: string = l10n(Text.button.delete);

  return (
    <Popup
      title={l10n(Text.title)}
      alpha={backgroundAlpha}
      zIndex={zIndex}
      onCloseClick={onClose}
      warningType={warningType}
    >
      <Root>
        {PopupDescription}
        <ConfirmButton onClick={handleConfirm} data-testid='warning-button'>{buttonText}</ConfirmButton>
      </Root>
    </Popup>
  );
};
