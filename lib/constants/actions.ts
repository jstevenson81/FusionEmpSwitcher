import auth from './auth'

const actions = {
  fusion: {
    workers: `${auth.podUrl}/hcmRestApi/resources/11.13.18.05/workers`,
    userAccounts: `${auth.podUrl}/hcmRestApi/resources/11.13.18.05/userAccounts`,
    roles: `${auth.podUrl}/hcmRestApi/scim/roles`,
  },
  ords: {
    ucsRoles: `${auth.ordsUrl}/ucsroles`,
  },
};

export default actions;
