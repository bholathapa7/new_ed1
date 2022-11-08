import _ from 'lodash-es';
import React, { ReactElement, ReactNode, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { batch, shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import styled from 'styled-components';

import LeftBoldArrowSVG from '^/assets/icons/left-bold-arrow.svg';
import { ConfirmButton as RawConfirmButton } from '^/components/atoms/Buttons';
import { RowValue } from '^/components/molecules/CoordinateTable';
import GCPInput, { MIN_GCP_NUMBER, getErrorRowIndexes } from '^/components/molecules/SourcePhotoUpload/GCPInput';
import MeshOptionInput from '^/components/molecules/SourcePhotoUpload/MeshOptionInput';
import ScreenAndFileInput from '^/components/molecules/SourcePhotoUpload/ScreenAndFileInput';
import dsPalette from '^/constants/ds-palette';
import palette from '^/constants/palette';
import { SideBar } from '^/constants/zindex';
import {
  UseGetDefaultScreenTitle, UseL10n, UseState, getLastCreatedScreenId,
  lastSelectedScreenSelector, typeGuardGCPGroup, useGetDefaultScreenTitle, useL10n, useProjectCoordinateSystem,
} from '^/hooks';
import { UseUploadContent, useUploadContent } from '^/hooks/useUploadContent';
import { PatchContent } from '^/store/duck/Contents';
import {
  ChangeContentsSidebarTab, ChangeIn3D, ChangeIn3DPointCloud,
  ChangeIsInSourcePhotoUpload, ChangeIsTopBarShown, ChangeTwoDDisplayMode, OpenContentPagePopup,
} from '^/store/duck/Pages';
import { PatchProjectConfig } from '^/store/duck/ProjectConfig';
import * as T from '^/types';
import { getCoordinateTitles } from '^/utilities/coordinate-util';
import { getInitialScreen, useFirstEmptyScreen } from '^/utilities/screen-util';
import { checkSignatureFromFiles } from '../AttachUploadPopup';
import Text from './text';

const DEFAULT_IS_GCP_USING: boolean = true;

type Page = number;
const INITIAL_PAGE: Page = 1;
const MAXIMUM_PAGE: Page = 3;

type ErrorInputKey = 'screen' | 'files' | 'gcp' | 'mesh';
const pageErrorKeyMap: { [K in Page]: Array<ErrorInputKey> } = {
  1: ['screen', 'files'],
  2: ['gcp'],
  3: ['mesh'],
};
type InputErrors = { [K in ErrorInputKey]?: boolean };


interface DisableProps {
  readonly isDisabled: boolean;
}

const Root = styled.aside({
  position: 'absolute',
  boxSizing: 'border-box',

  zIndex: SideBar.SUB_CALENDAR,

  width: '100%',
  height: '100%',

  display: 'flex',
  flexDirection: 'column',

  backgroundColor: palette.white.toString(),
});
Root.displayName = 'SourcePhotoUploadWrapper';

const Header = styled.header({
  boxSizing: 'border-box',
  position: 'relative',

  width: '100%',
  height: '50px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  paddingLeft: '13px',

  borderBottom: `1px solid ${palette.UploadPopup.inputBorder.toString()}`,
});

const LeftArrow = styled(LeftBoldArrowSVG)({
  position: 'absolute',
  left: 26,

  cursor: 'pointer',
});

const Title = styled.span({
  color: dsPalette.title.toString(),
  fontWeight: 'bold',
});

const MaxPage = styled.span({
  fontWeight: 'normal',
});

const Inputs = styled.ul({
  listStyle: 'none',

  flex: '1',
});

const ButtonWrapper = styled.div({
  boxSizing: 'border-box',

  width: '100%',

  padding: '0 20px 20px 20px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const ConfirmButton = styled(RawConfirmButton)(({ isDisabled }: DisableProps) => ({
  width: '100%',
  opacity: 1,

  cursor: 'pointer',

  ...(isDisabled ? ({
    backgroundColor: palette.iconDisabled.toString(),
    color: palette.buttonFontColor.toString(),
  }) : undefined),
}));


interface SelectorState {
  readonly sidebarTab: T.ContentsPageState['sidebarTab'];
  readonly twoDDisplayMode: T.ContentsPageState['twoDDisplayMode'];
  readonly isIn3D: T.ContentsPageState['in3D'];
  readonly isIn3DPointCloud: T.ContentsPageState['in3DPointCloud'];
  readonly projectId: T.ContentsPageState['projectId'];
  readonly isMapShown: T.ProjectConfig['isMapShown'];
}

function SourcePhotoUpload(): ReactElement {
  const dispatch: Dispatch = useDispatch();

  const [l10n]: UseL10n = useL10n();
  const getDefaultScreenTitle: UseGetDefaultScreenTitle = useGetDefaultScreenTitle();
  const uploadContent: UseUploadContent = useUploadContent();

  const {
    sidebarTab,
    twoDDisplayMode,
    isIn3D,
    isIn3DPointCloud,
    projectId,
    isMapShown,
  }: SelectorState = useSelector((s: T.State) => ({
    sidebarTab: s.Pages.Contents.sidebarTab,
    twoDDisplayMode: s.Pages.Contents.twoDDisplayMode,
    isIn3D: s.Pages.Contents.in3D,
    isIn3DPointCloud: s.Pages.Contents.in3DPointCloud,
    projectId: s.Pages.Contents.projectId,
    isMapShown: s.ProjectConfigPerUser.config?.isMapShown,
  }), shallowEqual);

  const firstEmptyScreen: T.Screen | undefined = useFirstEmptyScreen();
  const lastCreatedScreenGCPGroup: T.GCPGroupContent | undefined = useSelector((s: T.State) => {
    const lastCreatedScreenId: T.Screen['id'] | undefined = getLastCreatedScreenId(s.Screens.screens);

    if (lastCreatedScreenId === undefined) return;

    const gcpGroupId: T.GCPGroupContent['id'] | undefined = s.Contents.contents.allIds.find((contentId) => {
      const content: T.Content = s.Contents.contents.byId[contentId];

      return content.type === T.ContentType.GCP_GROUP && content.screenId === lastCreatedScreenId;
    });

    if (gcpGroupId === undefined) return;

    return typeGuardGCPGroup(s.Contents.contents.byId[gcpGroupId]);
  });
  const lastSelectedScreenMapId: T.Content['id'] | undefined = useSelector((s: T.State) => {
    const screenId: T.Screen['id'] | undefined = lastSelectedScreenSelector(s)?.id;

    if (screenId === undefined) return;

    return s.Contents.contents.allIds.find(
      (id) => s.Contents.contents.byId[id].screenId === screenId && s.Contents.contents.byId[id].type === T.ContentType.MAP,
    );
  });
  const projectCoordinateSystem: T.CoordinateSystem = useProjectCoordinateSystem();

  const [page, setPage]: UseState<Page> = useState<Page>(INITIAL_PAGE);
  const [screen, setScreen]: UseState<T.Screen> = useState<T.Screen>(() => {
    const defaultTitle: T.Screen['title'] = getDefaultScreenTitle(new Date());

    return getInitialScreen(defaultTitle);
  });
  const [files, setFiles]: UseState<File[]> = useState<File[]>([]);
  const [isGCPUsing, setIsGCPUsing]: UseState<boolean> = useState<boolean>(DEFAULT_IS_GCP_USING);
  const [crs, setCRS]: UseState<T.CoordinateSystem> = useState<T.CoordinateSystem>(() => {
    if (lastCreatedScreenGCPGroup === undefined) {
      return projectCoordinateSystem;
    } else {
      return lastCreatedScreenGCPGroup.info.crs;
    }
  });
  const [crsTitles, setCRSTitles]: UseState<string[]> = useState<string[]>(getCoordinateTitles(crs));
  const [gcps, setGCPs]: UseState<T.GCP[]> = useState<T.GCP[]>(() => {
    if (lastCreatedScreenGCPGroup !== undefined) {
      return lastCreatedScreenGCPGroup.info.gcps;
    }

    return [];
  });
  const [usingGCPScreenId, setUsingGCPScreenId]: UseState<T.Screen['id'] | undefined> = useState<T.Screen['id'] | undefined>(
    lastCreatedScreenGCPGroup?.screenId,
  );
  const [rows, setRows]: UseState<RowValue[]> = useState<RowValue[]>([]);
  const [errors, setErrors]: UseState<InputErrors> = useState<InputErrors>({});
  const [isMeshOption, setIsMeshOption]: UseState<boolean | null> = useState<boolean | null>(null);

  const validateInput: () => InputErrors = useCallback(() => {
    const nextErrors: InputErrors = {
      screen: errors.screen,
      files: files.length <= 0,
      gcp: isGCPUsing && (gcps.length < MIN_GCP_NUMBER || getErrorRowIndexes(rows).length > 0),
      mesh: isMeshOption === null,
    };

    return _.pick(nextErrors, pageErrorKeyMap[page]);
  }, [page, files, isGCPUsing, gcps.length, rows, isMeshOption]);

  const handlePreviousClick: () => void = useCallback(() => {
    if (page === INITIAL_PAGE) {
      batch(() => {
        dispatch(ChangeIsInSourcePhotoUpload({ isInSourcePhotoUpload: false }));
        dispatch(OpenContentPagePopup({ popup: T.ContentPagePopupType.UPLOAD }));
      });
    } else {
      setPage((prevPage) => prevPage - 1);
    }
  }, [page]);

  const handleConfirmClick: () => void = useCallback(() => {
    const nextErrors: InputErrors = validateInput();

    const hasErrorInThisPage: boolean = Object.values(nextErrors).some((nextError) => nextError);

    if (hasErrorInThisPage) {
      setErrors(nextErrors);

      return;
    }

    if (page !== MAXIMUM_PAGE) {
      setPage((prevPage) => prevPage + 1);

      return;
    }

    batch(() => {
      uploadContent({
        attachmentType: T.AttachmentType.SOURCE,
        files,
        screen,
        title: '',
        gcpGroupInfo: isGCPUsing ? { crs: T.ProjectionEnum[crs], gcps } : undefined,
        isMeshOption: Boolean(isMeshOption),
      });
      dispatch(ChangeIsInSourcePhotoUpload({
        isInSourcePhotoUpload: false,
      }));
    });
  }, [validateInput, page, screen, files, isGCPUsing, crs, gcps, isMeshOption]);

  const handleGCPError: (hasError: boolean) => void = useCallback((hasError) => {
    setErrors((prevState) => ({
      ...prevState,
      gcp: hasError,
    }));
  }, []);

  const handleScreenError: (hasError: boolean) => void = useCallback((hasError) => {
    setErrors((prevState) => ({
      ...prevState,
      screen: hasError,
    }));
  }, []);

  const isConfirmButtonDisabled: boolean = useMemo(() => {
    const nextErrors: InputErrors = validateInput();

    return pageErrorKeyMap[page].some((key) => nextErrors[key]);
  }, [page, validateInput]);

  useEffect(() => {
    const prevSidebarTab: T.ContentPageTabType = sidebarTab;

    batch(() => {
      if (prevSidebarTab === T.ContentPageTabType.PHOTO) {
        dispatch(ChangeContentsSidebarTab({ sidebarTab: T.ContentPageTabType.MAP }));
      }

      if (twoDDisplayMode !== T.TwoDDisplayMode.NORMAL) {
        dispatch(ChangeTwoDDisplayMode({ twoDDisplayMode: T.TwoDDisplayMode.NORMAL }));
      }

      if (isIn3DPointCloud) {
        dispatch(ChangeIn3DPointCloud({ in3DPointCloud: false }));
      }
      if (isIn3D) {
        dispatch(ChangeIn3D({ in3D: false }));
      }
      if (isIn3DPointCloud || isIn3D) {
        if (lastSelectedScreenMapId !== undefined) {
          dispatch(PatchContent({ content: { id: lastSelectedScreenMapId, config: { selectedAt: new Date() } } }));
        }
      }
      if (projectId !== undefined && !isMapShown) {
        dispatch(PatchProjectConfig({ projectId, config: { isMapShown: true } }));
      }

      dispatch(ChangeIsTopBarShown({ isOpened: false }));
    });

    return () => {
      if (prevSidebarTab === T.ContentPageTabType.PHOTO) {
        dispatch(ChangeContentsSidebarTab({ sidebarTab: T.ContentPageTabType.PHOTO }));
      }
      dispatch(ChangeIsTopBarShown({ isOpened: true }));
    };
  }, []);

  useEffect(() => {
    setErrors((prevState) => ({
      ...prevState,
      files: files.length > 0,
    }));

    checkSignatureFromFiles(files, T.AttachmentType.SOURCE, (hasError) => {
      setErrors((prevState) => ({
        ...prevState,
        files: hasError,
      }));
    });
  }, [files.length]);

  // User might already have an empty screen when creating a new project
  // on that day. It can be used as the default instead of creating a new one.
  useEffect(() => {
    if (firstEmptyScreen !== undefined) {
      setScreen(firstEmptyScreen);
    }
  }, []);

  const pageComponentMap: { [K in Page]: ReactNode } = {
    1: (
      <ScreenAndFileInput
        key='screen-file'
        screen={screen}
        files={files}
        hasFilesError={errors.files}
        hasScreenError={errors.screen}
        onScreenError={handleScreenError}
        onScreenChange={setScreen}
        setFiles={setFiles}
      />
    ),
    2: (
      <GCPInput
        key='gcp'
        isGCPUsing={isGCPUsing}
        usingGCPScreenId={usingGCPScreenId}
        crsTitles={crsTitles}
        gcps={gcps}
        rows={rows}
        crs={crs}
        hasGCPError={errors.gcp}
        onUsingGCPChange={setIsGCPUsing}
        onUsingGCPScreenIdChange={setUsingGCPScreenId}
        onGCPTitlesChange={setCRSTitles}
        onGCPsChange={setGCPs}
        onRowsChange={setRows}
        onCRSChange={setCRS}
        onError={handleGCPError}
      />
    ),
    3: (
      <MeshOptionInput
        key='mesh-option'
        isMeshOption={isMeshOption}
        onChange={setIsMeshOption}
      />
    ),
  };

  return (
    <Root>
      <Header>
        <LeftArrow onClick={handlePreviousClick} />
        <Title>
          {l10n(Text.title)} {page}
          <MaxPage>{`/${MAXIMUM_PAGE}`}</MaxPage>
        </Title>
      </Header>
      <Inputs>{pageComponentMap[page]}</Inputs>
      <ButtonWrapper>
        <ConfirmButton
          isDisabled={isConfirmButtonDisabled}
          onClick={handleConfirmClick}
        >
          {l10n(Text[page !== MAXIMUM_PAGE ? 'next' : 'upload'])}
        </ConfirmButton>
      </ButtonWrapper>
    </Root>
  );
}

export default memo(SourcePhotoUpload);
