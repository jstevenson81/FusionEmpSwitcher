import axios from 'axios'

import constants from './constants'
import { ordsRoleEntity } from './types/ords/entities/ordsRoleEntity'
import { ordsResponse } from './types/ords/ordsResponse'

const deleteOrdsUcsRole = async (
  roleId: number
): Promise<ordsResponse<ordsRoleEntity>> => {
  const response = await axios.delete<ordsResponse<ordsRoleEntity>>(
    `${constants.actions.ords.ucsRoles}/${roleId}`
  );
  return response.data;
};

const getOrdsUcsRoles = async (
  userName: string
): Promise<ordsResponse<ordsRoleEntity>> => {
  const roles = await axios.get<ordsResponse<ordsRoleEntity>>(
    constants.actions.ords.ucsRoles,
    {
      params: {
        q: `{USER_NAME: ${userName}}`,
      },
    }
  );
  return roles.data;
};

const OrdsLibrary = {
  deleteOrdsUcsRole,
  getOrdsUcsRoles,
};

export default OrdsLibrary;
