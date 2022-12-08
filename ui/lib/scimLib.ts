import axios, { AxiosResponse } from 'axios'
import _ from 'lodash'

import { actions, auth, OracleResponse, PodUserAccount, setUserAccountNameFilter } from './libsData'
import { OracleRole, OracleScimRoleResponse, OrdsResponse, UcsRole } from './scimTypes'

export const setAxiosDefaults = (): void => {
  axios.defaults.auth = { username: auth.userName, password: auth.password };
};

const patchFusionUserNewPerson = async ({
  targetUserGuid,
  targetWorkerPersId,
}: {
  targetUserGuid: string;
  targetWorkerPersId: string;
}): Promise<PodUserAccount> => {
  const targetUser = await ScimLibrary.fusion.userAccounts.getFusionUserByGuid(
    targetUserGuid
  );
  if (_.isNil(targetUser.GUID) || targetUser.GUID !== targetUserGuid)
    throw new Error(`The user account GUID ${targetUserGuid} was not found`);

  const targetWorker =
    await ScimLibrary.fusion.workers.getFusionWorkerByPersonId(
      targetWorkerPersId
    );
  if (_.isEmpty(targetWorker.items)) {
    throw new Error(`The worker with id ${targetWorkerPersId} was not found`);
  }

  const targetWorkerUserResp =
    await ScimLibrary.fusion.userAccounts.getFusionUserByPersonId(
      targetWorkerPersId
    );

  const targetWorkerUser =
    !_.isNil(targetWorkerUserResp) && targetWorkerUserResp.count === 1
      ? _.first(targetWorkerUserResp.items)
      : null;

  // set both account to have no person record
  await axios.patch(`${actions.fusion.userAccounts}/${targetUser.GUID}`, {
    PersonId: null,
  });
  // only set this one to null if it isn't already null
  if (!_.isNil(targetWorkerUser)) {
    await axios.patch(
      `${actions.fusion.userAccounts}/${targetWorkerUser.GUID}`,
      {
        PersonId: null,
      }
    );
  }
  // set the person record to the user account of the current user
  await axios.patch<PodUserAccount>(
    `${actions.fusion.userAccounts}/${targetUser.GUID}`,
    {
      PersonId: targetWorkerPersId,
    }
  );
  // set the suspended flag of the user we just added this account to
  // as not suspenede
  const userResponse = await axios.patch<PodUserAccount>(
    `${actions.fusion.userAccounts}/${targetUser.GUID}`,
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
): Promise<OracleResponse<PodUserAccount>> => {
  const userResp = await axios.get<OracleResponse<PodUserAccount>>(
    `${actions.fusion.userAccounts}/?onlyData=true&q=PersonId=${workerPersId}`
  );

  return userResp.data;
};

const getFusionWorkerByPersonId = async (
  workerPersId: string
): Promise<OracleResponse<Worker>> => {
  const personResp = await axios.get<OracleResponse<Worker>>(
    `${actions.fusion.workers}/?onlyData=true&q=PersonId=${workerPersId}&fields=PersonId,PersonNumber`
  );
  return personResp.data;
};

const getFusionUserByGuid = async (guid: string): Promise<PodUserAccount> => {
  setAxiosDefaults();

  const resp = await axios.get<PodUserAccount>(
    `${actions.fusion.userAccounts}/${guid}?onlyData=true`
  );
  return resp.data;
};

const getFusionUserByUserName = async (
  userName: string | string[]
): Promise<OracleResponse<PodUserAccount>> => {
  setAxiosDefaults();
  const filter = setUserAccountNameFilter(userName);

  const userAccountResp = await axios.get<OracleResponse<PodUserAccount>>(
    `${actions.fusion.userAccounts}${filter}`
  );
  return userAccountResp.data;
};

const getPodRoleByName = async (roleName: string): Promise<OracleRole> => {
  setAxiosDefaults();
  const response = await axios.get<OracleScimRoleResponse>(
    actions.fusion.roles,
    {
      params: {
        filter: `displayName eq "${roleName}"`,
        attributes: "schemas,id,displayName",
      },
    }
  );

  return response.data.Resources[0];
};

const getPodRolesByUserName = async (
  userName: string
): Promise<OracleRole[]> => {
  setAxiosDefaults();
  const response = await axios.get<OracleScimRoleResponse>(
    actions.fusion.roles,
    {
      params: {
        filter: `userName eq "${userName}"`,
        attributes: "id,roles.id,roles.displayName,roles.description",
      },
    }
  );

  return response.data.Resources;
};

const deleteOrdsUcsRole = async (
  roleId: number
): Promise<OrdsResponse<UcsRole>> => {
  const response = await axios.delete(`${actions.ords.ucsRoles}/${roleId}`);
  return response.data;
};

const getOrdsUcsRoles = async (
  userName: string
): Promise<OrdsResponse<UcsRole>> => {
  const roles = await axios.get<OrdsResponse<UcsRole>>(actions.ords.ucsRoles, {
    params: {
      q: `{USER_NAME: ${userName}}`,
    },
  });
  return roles.data;
};

const postOrdsUcsRoles = async ({
  userName,
  userId,
  roles,
}: {
  userName: string;
  userId: string;
  roles: OracleRole[];
}): Promise<AxiosResponse[]> => {
  const responses: AxiosResponse[] = [];

  roles.forEach(async (role) => {
    const ucsRole: UcsRole = {
      id: null,
      role_id: role.id,
      role_name: role.displayName,
      user_id: userId,
      user_name: userName,
    };
    const response = await axios.post(actions.ords.ucsRoles, { ucsRole });
    responses.push(response);
  });
  return responses;
};

const ScimLibrary = {
  ords: {
    roles: {
      getOrdsUcsRoles,
      postOrdsUcsRoles,
      deleteOrdsUcsRole,
    },
  },
  fusion: {
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
  },
  axios: {
    setAxiosDefaults,
  },
};

export default ScimLibrary;
