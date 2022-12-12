import axios from 'axios'
import _ from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'

import { auth } from '../../../../lib/commonLib'
import HandleAxiosErrorResponse from '../../../../lib/errorHandlerAxios'
import ScimLibrary from '../../../../lib/scimLib'
import { PodUserAccount } from '../../../../lib/types/podUserAccount'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PodUserAccount | undefined | unknown>
) {
  try {
    axios.defaults.auth = { username: auth.userName, password: auth.password };

    const { userName } = req.query;
    if (_.isNil(userName))
      throw new Error(
        'The user name cannot be null or empty to search for a user account'
      );

    const response = await ScimLibrary.fusion.roles.getPodRolesByUserName(
      userName
    );
    res.status(200).json(_.first(response.items));
  } catch (e) {
    HandleAxiosErrorResponse({ e, res });
  }
}
