import React, { ComponentType, FC } from 'react';
import * as T from '^/types';

import { useAuthedUser } from '^/hooks/useAuthedUser';
import { ESS_FEATURE_SLUG } from '^/constants/network';

export type HasFeature = (feature: T.Feature) => boolean;
type CreateHasFeature = (userPerm: number) => HasFeature;
type UseHasFeature = () => HasFeature;

export const DEFAULT_USER_FEATURE_PERMISSION: number = NaN;
const FeatureMapper: Record<T.Feature, number> = {
  [T.Feature.DDM]: 1,
  [T.Feature.ESS]: 2,
};

export const getUserFeaturePermission: (feature: T.Feature) => T.User['featurePermission'] = (feature) => {
  if (FeatureMapper[feature] === undefined) {
    // eslint-disable-next-line no-console
    console.warn(`Unknown user feature: ${feature}.`);

    return DEFAULT_USER_FEATURE_PERMISSION;
  }

  return FeatureMapper[feature];
};

export const getFeaturePermissionFromSlug: (slug: T.PlanConfig['slug']) => T.User['featurePermission'] = (slug) => {
  switch (slug) {
    case ESS_FEATURE_SLUG: {
      return FeatureMapper[T.Feature.ESS];
    }
    case undefined:
    default: {
      return FeatureMapper[T.Feature.DDM];
    }
  }
};

export const createHasFeature: CreateHasFeature = (userPerm) => (feature) => {
  const perm: T.User['featurePermission'] = getUserFeaturePermission(feature);

  // eslint-disable-next-line no-bitwise
  return (userPerm & perm) === perm;
};

export const useHasFeature: UseHasFeature = () => (perm) => {
  const user: T.User | undefined = useAuthedUser();
  const hasFeature: HasFeature = createHasFeature(user?.featurePermission ?? DEFAULT_USER_FEATURE_PERMISSION);

  return hasFeature(perm);
};

export function withFeatureToggle<Props = any>(feature: T.Feature): (Component: ComponentType<Props>) => FC<Props> {
  return (Component) => ({ ...props }: Props) => {
    const hasFeature: HasFeature = useHasFeature();

    /**
     * @desc
     * I modified the code below temporarily to show ESS model group list items.
     * There are too much things to modify if I remove the parameter [feature] of [withFeatureToggle].
     * Therefore, removing the parameter [feature] of [withFeatureToggle] and modifying the related are to be done later.
     */
    return hasFeature(feature) ? <Component {...props} /> : <Component {...props} />;
  };
}
