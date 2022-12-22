import _ from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'

import ApiAppLib from '../../../../lib/ApiAppLib'
import FusionUserAccount from '../../../../lib/models/fusion/FusionUserAccount'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<FusionUserAccount | undefined | unknown>,
) {
    const appLib = new ApiAppLib();
    try {
        const { userName } = req.query;
        if (_.isNil(userName))
            throw new Error(
                'The user name cannot be null or empty to search for a user account',
            );
        const userAccountResp = await appLib.getOracleUser(
            ApiAppLib.getQueryParamValue(userName),
        );
        return res.status(200).json(userAccountResp);
    } catch (e) {
        return ApiAppLib.makeAxiosErrorResponse({ e, res });
    }
}
