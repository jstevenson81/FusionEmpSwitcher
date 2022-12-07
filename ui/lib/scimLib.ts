import axios, { AxiosResponse } from 'axios'

import { actions, auth } from './libsData'

export const setAxiosDefaults = (): void => {
  axios.defaults.auth = { username: auth.userName, password: auth.password };
};

export const getRoleData = async (roleName: string): Promise<OracleRole> => {
  setAxiosDefaults();
  const response = await axios.get<OracleScimRoleResponse>(actions.roles, {
    params: {
      filter: `displayName eq "${roleName}"`,
      attributes: "schemas,id,displayName",
    },
  });

  return response.data.Resources[0];
};

export const getUserRoles = async (userName: string): Promise<OracleRole[]> => {
  setAxiosDefaults();
  const response = await axios.get<OracleScimRoleResponse>(actions.roles, {
    params: {
      filter: `userName eq "${userName}"`,
      attributes: "id,roles.id,roles.displayName,roles.description",
    },
  });

  return response.data.Resources;
};

export const saveUserRoles = async ({
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
    const response = await axios.post(actions.ords.saveRoles, {
      id: null,
      role_id: role.id,
      role_name: role.displayName,
      user_id: userId,
      user_name: userName,
    });
    responses.push(response);
  });
  return responses;
};

export interface OracleMeta {
  location: string;
  resourceType: string;
  created: string;
  lastModified: string;
}

export interface OracleMember {
  value: string;
}

export interface OracleRole {
  id: string;
  meta: OracleMeta;
  schemas: string[];
  name: string;
  displayName: string;
  description: string;
  category: string;
  members: OracleMember[];
  value: string;
}

export interface OracleScimRoleResponse {
  itemsPerPage: number;
  startIndex: number;
  Resources: OracleRole[];
}
