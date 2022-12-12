import axios from 'axios'
import _ from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'

import { auth } from '../../../../lib/commonLib'
import HandleAxiosErrorResponse from '../../../../lib/errorHandlerAxios'
import ScimLibrary from '../../../../lib/scimLib'
import { PodUserAccount } from '../../../../lib/types/podUserAccount'

const ROLE_NAME = 'Employee';

/**
 * This method handles saving a user's roles and giving them only the requested roles
 * based on a template.  Example: employee only get the Employee Abstract role
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PodUserAccount | undefined | unknown>
) {
  try {
    if (req.method !== 'POST')
      throw new Error(
        `The method ${req.method} is not supported by this endpoint.  Please user POST`
      );
    axios.defaults.auth = { username: auth.userName, password: auth.password };

    const { roleTemplate, userName, userId, storeMyRoles } = req.body;
    if (_.isNil(roleTemplate) || _.isEmpty(roleTemplate)) {
      throw new Error(
        'The body of the request must contain a roleTemplate.  A role template is an agreed upon role or set of roles a user can request for thier account'
      );
    }
    if (_.isNil(userName) || _.isEmpty(userName)) {
      throw new Error(
        "The body of the request must contain a user's user name."
      );
    }
    if (_.isNil(storeMyRoles) || _.isEmpty(storeMyRoles)) {
      throw new Error(
        "The body of the request must contain a property called storeMyRoles.  This property tells the system to store your the user's roles in the database for future resetting"
      );
    }
    if (_.isNil(userId) || _.isEmpty(userId)) {
      throw new Error(
        "The body of the request must contain a user's user id as it is in the pod."
      );
    }

    const role = await ScimLibrary.fusion.roles.getPodRole(ROLE_NAME);
    const userRoles = await ScimLibrary.fusion.roles.getUserRoles(userName);
    // store the user's roles if they are requesting they be stored
    if (storeMyRoles) {
      const existingRoles = await ScimLibrary.ords.roles.getOrdsUcsRoles(
        userName
      );
      existingRoles.items.forEach(async (r) => {
        await ScimLibrary.ords.roles.deleteOrdsUcsRole(r.id!);
      });
    }
  } catch (e) {
    HandleAxiosErrorResponse({ e, res });
  }
}
