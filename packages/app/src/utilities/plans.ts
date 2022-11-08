import { ESS_FEATURE_SLUG } from '^/constants/network';

export const belongsToPlan: (slug: string | undefined) => boolean = (slug) => !!slug && slug !== ESS_FEATURE_SLUG;
