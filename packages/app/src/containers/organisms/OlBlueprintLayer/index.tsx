import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import * as T from '^/types';

import OlBlueprintLayer, { Props } from '^/components/organisms/OlBlueprintLayer';
import { ChangeAligningBlueprintScratchpad } from '^/store/duck/Pages/Content';

type StatePropKeys = 'opacity' | 'content' | 'edit' | 'isAligning';
type DispatchPropKeys = 'updatePoint';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys> & {
  content: Props['content'];
};
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: (
  state: Pick<T.State, 'Pages'>, ownProps: OwnProps,
) => StateProps = (
  { Pages }, ownProps,
) => {
  const isAligning: boolean = Pages.Contents.editingContentId === ownProps.content.id &&
    Pages.Contents.aligningBlueprintId === Pages.Contents.editingContentId;

  return {
    edit: Pages.Contents.editingContentId === ownProps.content.id,
    isAligning,
    content: {
      ...ownProps.content,
      info: {
        ...ownProps.content.info,
        ...(isAligning && Pages.Contents.aligningBlueprintScratchpad),
      },
    },
    opacity: ownProps.content.config?.opacity,
  };
};

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  updatePoint(geoPoint: T.BlueprintPDFContent['info']['geoPoint']): void {
    dispatch(ChangeAligningBlueprintScratchpad({
      data: { geoPoint },
    }));
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(OlBlueprintLayer);
