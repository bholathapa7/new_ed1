import * as T from '^/types';

export type VendorUser = Pick<T.User, 'email' | 'firstName' | 'lastName' | 'organization'> &
{ id: string };

export const getVendorUser: (
state: T.State,
) => VendorUser | null = (
  state,
) => {
  const id: number | undefined = state.Auth.authedUser?.id;
  if (id) {
    const { email, firstName, lastName, organization }: T.User = state.Users.users.byId[id];

    return { id: String(id), email, firstName, lastName, organization };
  } else {
    return null;
  }
};
