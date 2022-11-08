import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import OlBlueprintAlignLayer, { Props } from '^/components/atoms/OlBlueprintAlignLayer';
import { ChangeAligningBlueprintScratchpad } from '^/store/duck/Pages';
import * as T from '^/types';

type DispatchPropKeys = 'updatePoint';
export type OwnProps = Omit<Props, DispatchPropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  updatePoint(imagePoint: T.BlueprintPDFContent['info']['imagePoint']): void {
    dispatch(ChangeAligningBlueprintScratchpad({
      data: { imagePoint },
    }));
  },
});

export default connect(null, mapDispatchToProps)(OlBlueprintAlignLayer);
