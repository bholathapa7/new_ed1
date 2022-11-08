import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import PointEditTutorialPanel, { Props } from '^/components/molecules/PointEditTutorialPanel';
import { PatchUserConfig } from '^/store/duck/UserConfig';
import * as T from '^/types';

type StatePropKey = 'isPointEditTutorialPanelShown' | 'isEditable' | 'projectId';
type DispatchPropsKey = 'onClosePointEditTutorialPanel';
export type OwnProps = Omit<Props, StatePropKey | DispatchPropsKey>;
export type StateProps = Pick<Props, StatePropKey>;
export type DispatchProps = Pick<Props, DispatchPropsKey>;

export const mapStateToProps: (
  state: Pick<T.State, 'Pages' | 'Contents' | 'UserConfig'>,
) => StateProps = (
  { Pages, Contents, UserConfig },
) => {
  const editingContentId: number | undefined = Pages.Contents.editingContentId;
  const type: string | undefined = editingContentId ?
    Contents.contents.byId[editingContentId].type : undefined;
  const isAnnotationContentType: boolean =
  [T.ContentType.LENGTH, T.ContentType.AREA, T.ContentType.VOLUME]
    .some((t: T.ContentType) => t === type);
  type AnnotationContent = T.LengthContent | T.AreaContent | T.VolumeContent;
  const locationLen: number | undefined = editingContentId && isAnnotationContentType ?
    (Contents.contents.byId[editingContentId] as AnnotationContent)
      .info.locations.length : undefined;
  // Prevent the tutorial from being shown when you finish making a new layer
  const isNotNewLayer: boolean | undefined = editingContentId && locationLen ?
    (type === T.ContentType.LENGTH ? locationLen > 1 : locationLen > 2) : undefined;

  return {
    isPointEditTutorialPanelShown: UserConfig.config?.isPointEditTutorialPanelShown,
    isEditable: editingContentId !== undefined && type !== undefined &&
    // The tutorial is needed only for these contents
               isNotNewLayer,
    projectId: Pages.Contents.projectId,
  };
};

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  onClosePointEditTutorialPanel(
    isPointEditTutorialPanelShown: NonNullable<T.UserConfig['isPointEditTutorialPanelShown']>,
  ): void {
    dispatch(PatchUserConfig({
      config: {
        isPointEditTutorialPanelShown,
      },
    }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PointEditTutorialPanel);
