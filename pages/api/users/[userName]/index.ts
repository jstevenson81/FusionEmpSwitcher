import _ from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'

import AppLib from '../../../../lib/AppLib'
import FusionUserAccount from '../../../../lib/models/fusion/FusionUserAccount'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FusionUserAccount | undefined | unknown>
) {
  const appLib = new AppLib();
  try {
    const { userName } = req.query;
    if (_.isNil(userName))
      throw new Error(
        'The user name cannot be null or empty to search for a user account'
      );
    const userAccountResp = await appLib.getOracleUser(
      AppLib.getQueryParamValue(userName)
    );
    return res.status(200).json(userAccountResp);
  } catch (e) {
    return AppLib.makeAxiosErrorResponse({ e, res });
  }
}
