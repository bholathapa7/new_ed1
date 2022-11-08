import config, { NodeEnv } from '^/config';
import { VendorUser } from '.';

interface ElasticApmUser {
  id: string;
  username: string;
  email: string;
}

export const insertUserToElasticApm: (vendorUser: VendorUser) => void = (vendorUser) => {
  if (config.env !== NodeEnv.DEVELOPMENT) {
    const elasticApmUser: ElasticApmUser = {
      id: vendorUser.id,
      username: `${vendorUser.firstName} ${vendorUser.lastName}`,
      email: vendorUser.email,
    };
    window.elasticApm.setUserContext(elasticApmUser);
  }
};

export const deleteElasticApmUser: () => void = () => {
  if (config.env !== NodeEnv.DEVELOPMENT) {
    window.elasticApm.setUserContext({});
  }
};
