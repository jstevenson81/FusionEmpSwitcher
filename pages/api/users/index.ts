import axios, { AxiosError } from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

import AppLib from '../../../lib/AppLib'
import FusionUserAccount from '../../../lib/models/fusion/FusionUserAccount'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<FusionUserAccount | undefined | unknown>,
) {
    const appLib = new AppLib();
    try {
        if (req.method !== 'POST')
            throw new Error(
                `${req.method} is not supported for this endpoint.  Please use a post`,
            );
        const { userGuid, workerPersId } = req.body;
        const response = await appLib.tieUserAndEmp({ userGuid, workerPersId });

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
