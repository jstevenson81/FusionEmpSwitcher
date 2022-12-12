import _ from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'

import HandleAxiosErrorResponse from '../../../lib/errorHandlerAxios'
import ScimLibrary from '../../../lib/scimLib'
import { fusionUserAccount } from '../../../lib/types/fusion/restEntities/fusionUserAccount'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<fusionUserAccount | undefined | unknown>
) {
  try {
    if (req.method !== 'PATCH')
      throw new Error(
        `${req.method} is not supported for this endpoint.  Please use PATCH`
      );
    const { userGuid, workerPersId } = req.body;
    if (_.isNil(userGuid) || _.isNil(workerPersId))
      throw new Error(
        'The request body must look like the following {"userGuid": string, "personId", number}'
      );

    const userResponse =
      await ScimLibrary.fusion.userAccounts.patchFusionUserNewPerson({
        targetUserGuid: userGuid,
        targetWorkerPersId: workerPersId,
      });

    res.status(200).json(userResponse);
  } catch (e) {
    HandleAxiosErrorResponse({ e, res });
  }
}
