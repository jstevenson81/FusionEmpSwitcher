import axios, { AxiosResponse } from 'axios'
import _ from 'lodash'

import commonLib from './commonLib'
import constants from './constants'
import { fusionRestResponse } from './types/fusion/fusionRestResponse'
import { fusionUserAccount } from './types/fusion/restEntities/fusionUserAccount'
import { oracleRole } from './types/fusion/SCIM/oracleRole'
import { oracleScimRoleResponse } from './types/fusion/SCIM/oracleScimRoleResponse'
import { ordsRoleEntity } from './types/ords/entities/ordsRoleEntity'

export const setAxiosDefaults = (): void => {
  axios.defaults.auth = {
    username: constants.auth.userName,
    password: constants.auth.password,
  };
};

const patchFusionUserNewPerson = async ({
  targetUserGuid,
  targetWorkerPersId,
}: {
  targetUserGuid: string;
  targetWorkerPersId: string;
}): Promise<fusionUserAccount> => {
  const targetUser = await getFusionUserByGuid(targetUserGuid);
  if (_.isNil(targetUser.GUID) || targetUser.GUID !== targetUserGuid)
    throw new Error(`The user account GUID ${targetUserGuid} was not found`);

  const targetWorker = await getFusionWorkerByPersonId(targetWorkerPersId);
  if (_.isEmpty(targetWorker.items)) {
    throw new Error(`The worker with id ${targetWorkerPersId} was not found`);
  }

  const targetWorkerUserResp = await getFusionUserByPersonId(
    targetWorkerPersId
  );

  const targetWorkerUser =
    !_.isNil(targetWorkerUserResp) && targetWorkerUserResp.count === 1
      ? _.first(targetWorkerUserResp.items)
      : null;

  // set both account to have no person record
  await axios.patch(
    `${constants.actions.fusion.userAccounts}/${targetUser.GUID}`,
    {
      PersonId: null,
    }
  );
  // only set this one to null if it isn't already null
  if (!_.isNil(targetWorkerUser)) {
    await axios.patch(
      `${constants.actions.fusion.userAccounts}/${targetWorkerUser.GUID}`,
      {
        PersonId: null,
      }
    );
  }
  // set the person record to the user account of the current user
  await axios.patch<fusionUserAccount>(
    `${constants.actions.fusion.userAccounts}/${targetUser.GUID}`,
    {
      PersonId: targetWorkerPersId,
    }
  );
  // set the suspended flag of the user we just added this account to
  // as not suspenede
  const userResponse = await axios.patch<fusionUserAccount>(
    `${constants.actions.fusion.userAccounts}/${targetUser.GUID}`,
    {
      SuspendedFlag: false,
    }
  );
  // return the data from the user response
  // so we can validate the process worked as expected
  return userResponse.data;
};

const getFusionUserByPersonId = async (
  workerPersId: string
): Promise<fusionRestResponse<fusionUserAccount>> => {
  const userResp = await axios.get<fusionRestResponse<fusionUserAccount>>(
    `${constants.actions.fusion.userAccounts}/?onlyData=true&q=PersonId=${workerPersId}`
  );

  return userResp.data;
};

const getFusionWorkerByPersonId = async (
  workerPersId: string
): Promise<fusionRestResponse<Worker>> => {
  const personResp = await axios.get<fusionRestResponse<Worker>>(
    `${constants.actions.fusion.workers}/?onlyData=true&q=PersonId=${workerPersId}&fields=PersonId,PersonNumber`
  );
  return personResp.data;
};

const getFusionUserByGuid = async (
  guid: string
): Promise<fusionUserAccount> => {
  setAxiosDefaults();

  const resp = await axios.get<fusionUserAccount>(
    `${constants.actions.fusion.userAccounts}/${guid}?onlyData=true`
  );
  return resp.data;
};

const getFusionUserByUserName = async (
  userName: string | string[]
): Promise<fusionRestResponse<fusionUserAccount>> => {
  setAxiosDefaults();
  const filter = commonLib.setUserAccountNameFilter(userName);

  const userAccountResp = await axios.get<
    fusionRestResponse<fusionUserAccount>
  >(`${constants.actions.fusion.userAccounts}${filter}`);
  return userAccountResp.data;
};

const getPodRoleByName = async (
  roleName: string | string[]
): Promise<oracleRole> => {
  setAxiosDefaults();
  const response = await axios.get<oracleScimRoleResponse>(
    constants.actions.fusion.roles,
    {
      params: {
        filter: `displayName eq "${roleName}"`,
        attributes: 'schemas,id,displayName',
      },
    }
  );

  return response.data.Resources[0];
};

const getPodRolesByUserName = async (
  userName: string | string[]
): Promise<oracleRole[]> => {
  setAxiosDefaults();
  const response = await axios.get<oracleScimRoleResponse>(
    constants.actions.fusion.roles,
    {
      params: {
        filter: `userName eq "${userName}"`,
        attributes: 'id,roles.id,roles.displayName,roles.description',
      },
    }
  );

  return response.data.Resources;
};

const postOrdsUcsRoles = async ({
  userName,
  userId,
  roles,
}: {
  userName: string;
  userId: string;
  roles: oracleRole[];
}): Promise<AxiosResponse[]> => {
  const responses: AxiosResponse[] = [];

  roles.forEach(async (role) => {
    const ucsRole: ordsRoleEntity = {
      id: null,
      role_id: role.id,
      role_name: role.displayName,
      user_id: userId,
      user_name: userName,
    };
    const response = await axios.post(constants.actions.ords.ucsRoles, {
      ucsRole,
    });
    responses.push(response);
  });
  return responses;
};

const ScimLibrary = {
  workers: {
    getFusionWorkerByPersonId,
  },
  userAccounts: {
    getFusionUserByUserName,
    getFusionUserByGuid,
    getFusionUserByPersonId,
    patchFusionUserNewPerson,
  },
  roles: {
    getPodRolesByUserName,
    getPodRoleByName,
  },
  axios: {
    setAxiosDefaults,
  },
};

export default ScimLibrary;
