import { NextApiRequest, NextApiResponse } from 'next'

import ApiAppLib from '../../../../lib/ApiAppLib'
import FusionUserAccount from '../../../../lib/models/fusion/FusionUserAccount'

/**
 * This method handles saving a user's roles and giving them only the requested roles
 * based on a template.  Example: employee only get the Employee Abstract role.
 * We save the entire set of their roles, and assign their new roles based on the
 * templates they requested
 * @param {NextApiRequest} req
 * @param {NextApiResponse} res
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<FusionUserAccount | undefined | unknown>,
) {
    const appLib = new ApiAppLib();

    try {
        if (req.method !== 'GET')
            throw new Error(
                `The method ${req.method} is not supported by this endpoint.  Please use GET`,
            );
        const { userName } = req.query;
        const realUserName = ApiAppLib.getQueryParamValue(userName);
        const roles = await appLib.getUserRoles(realUserName);
        return res.status(200).json(roles);
    } catch (error) {
        return ApiAppLib.makeAxiosErrorResponse({ error, res });
    }
}
