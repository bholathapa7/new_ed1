// DEBUG: console.log(process.env);

/**
 * enum representing build level
 */
export enum BuildLevel {
  PR = 'pr',
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

interface Config {
  env: string;
  buildLevel: BuildLevel;
  isNotProduction: boolean;
  isBrowser: boolean;
  isReactQueryDevtoolsOn: boolean;
}

const rootConfig: { all: Config } = {
  all: {
    /* eslint-disable @typescript-eslint/strict-boolean-expressions */
    env: process.env.NODE_ENV as NodeEnv,
    buildLevel: process.env.BUILD_LEVEL as BuildLevel,
    /**
     * @fixme
     * `isNotProduciton` is not a valid explanation.
     * `isNotLocal` or `isDeployed` is better term for this property.
     * Please fix this.
     */
    isNotProduction: process.env.NODE_ENV !== 'production',
    isBrowser: window !== undefined,
    isReactQueryDevtoolsOn: process.env.NODE_ENV === 'development' && process.env.REACT_QUERY_DEVTOOLS === 'true',
    /* eslint-enable @typescript-eslint/strict-boolean-expressions */
  },
};

const config: Config = rootConfig.all;

export default config;
