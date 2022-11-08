import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { ChangeLanguage } from '^/store/duck/Pages';
import { OpenProjectPagePopup } from '^/store/duck/Pages/Project';
import { PatchUserInfo } from '^/store/duck/Users';
import * as T from '^/types';

import ProjectMypageTab, { Props } from '^/components/organisms/ProjectMypageTab';

type StatePropKeys = 'authedUser' | 'apiStatus' | 'initFormValues';
type DispatchPropKeys = 'submit' | 'onSuccess';
export type OwnProps = Omit<Props, StatePropKeys | DispatchPropKeys>;
export type StateProps = Pick<Props, StatePropKeys>;
export type DispatchProps = Pick<Props, DispatchPropKeys>;

export const mapStateToProps: (
  state: Pick<T.State, 'Auth' | 'Users' | 'Pages'>,
) => StateProps = (
  { Auth, Users, Pages },
) => ({
  authedUser: (
    Auth.authedUser !== undefined ?
    Users.users.byId[Auth.authedUser.id] as T.FullUser :
      undefined
  ),
  apiStatus: Users.patchUserInfoStatus,
  initFormValues: Pages.Project.myPageFormValues,
});

export const mapDispatchToProps: (
  dispatch: Dispatch,
) => DispatchProps = (
  dispatch,
) => ({
  submit(formValues: Pick<T.User, 'id'> & T.MyPageFormValues): void {
    if (formValues.password.length > 0 && formValues.password === formValues.passwordConfirmation) {
      dispatch(OpenProjectPagePopup({ popup: T.ProjectPagePopupType.CONFIRM_USER_UPDATE }));
    } else {
      dispatch(PatchUserInfo({
        user: {
          ...formValues,
          avatar: formValues.avatar !== undefined ?
            formValues.avatar.file : undefined,
        },
      }));

      if (formValues.language !== undefined) {
        dispatch(ChangeLanguage({
          language: formValues.language,
        }));
      }
    }
  },
  onSuccess(): void {
    dispatch(OpenProjectPagePopup({ popup: T.ProjectPagePopupType.USER_UPDATE_SUCCESS }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectMypageTab);
