import _ from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'

import HandleAxiosErrorResponse from '../../../lib/errorLib'
import ScimLibrary from '../../../lib/scimLib'
import { PodUserAccount } from '../../../ui/lib/libsData'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PodUserAccount | undefined | unknown>
) {
  try {
    if (req.method !== 'POST')
      throw new Error(
        `${req.method} is not supported for this endpoint.  Please use a post`
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
