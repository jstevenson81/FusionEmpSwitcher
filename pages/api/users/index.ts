import axios, { AxiosError } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

import ApiAppLib from '../../../lib/ApiAppLib'
import FusionUserAccount from '../../../lib/models/fusion/FusionUserAccount'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<FusionUserAccount | undefined | unknown>,
) {
    const appLib = new ApiAppLib();
    try {
        if (req.method !== 'POST')
            throw new Error(
                `${req.method} is not supported for this endpoint.  Please use a post`,
            );
        const { targetUserGuid, workerPersonId } = req.body;
        const response = await appLib.tieUserAndEmp({
            targetUserGuid,
            workerPersonId,
        });

        res.status(200).json(response);
    } catch (e) {
        console.log(e);
        const axiosError = e as AxiosError;
        res.status(400).json({
            error: axiosError.response?.data,
            response: {
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                config: {
                    url: axiosError.response?.config.url,
                    passedData: axiosError.response?.config.data,
                },
            },
        });
    }
}
