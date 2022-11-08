import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import * as T from '^/types';

import EmailSuccessMessage, { Props } from '^/components/molecules/EmailSuccessMessage';

type StatePropsKey = 'formValues';
type DispatchPropsKey = never;
export type OwnProps = Omit<Props, StatePropsKey | DispatchPropsKey>;
export type StateProps = Pick<Props, StatePropsKey>;
export type DispatchProps = Pick<Props, DispatchPropsKey>;

export const mapStateToProps: (
  state: Pick<T.State, 'Pages' | 'PlanConfig'>,
) => StateProps = (
  state,
) => ({
  formValues: state.Pages.Front.passwordFormValues,
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
) => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(EmailSuccessMessage);
