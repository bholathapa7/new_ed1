import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {
  ChangeEditingContent,
  ChangeIsTopBarShown,
  ChangeSidebarStatus,
  CloseContentPagePopup,
  SubmitAligningBlueprintScratchpad,
} from '^/store/duck/Pages/Content';

import BlueprintTopbar, { Props } from '^/components/molecules/BlueprintTopbar';

type StatePropKeys = never;
type DispatchPropKeys = 'closePopup' | 'submit' | 'cancel';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  closePopup(): void {
    dispatch(CloseContentPagePopup());
  },
  submit(): void {
    dispatch(SubmitAligningBlueprintScratchpad());
    dispatch(ChangeIsTopBarShown({ isOpened: true }));
    dispatch(ChangeSidebarStatus({ open: true }));
  },
  cancel(): void {
    dispatch(ChangeEditingContent({}));
    dispatch(ChangeIsTopBarShown({ isOpened: true }));
    dispatch(ChangeSidebarStatus({ open: true }));
  },
});

export default connect(undefined, mapDispatchToProps)(BlueprintTopbar);
