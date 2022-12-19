import axios, { AxiosError } from 'axios'
import _ from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'

import AppLib from '../../../lib/AppLib'
import FusionResponse from '../../../lib/models/fusion/FusionResponse'
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
        if (_.isNil(userGuid) || _.isNil(workerPersId))
            throw new Error(
                'The request body must look like the following {"userGuid": string, "personId", number}',
            );

        const userCheck = await appLib.getFusionUserByGuid(userGuid);
        if (
            _.isNil(userCheck) ||
            _.isNil(userCheck.GUID) ||
            userCheck.GUID !== userGuid
        )
            throw new Error(`The user account GUID ${userGuid} was not found`);

        const personCheck = await axios.get<FusionResponse<Worker>>(
            `${libs.constants.actions.workers}/?onlyData=true&q=PersonId=${workerPersId}&fields=PersonId,PersonNumber`,
        );

        if (_.isEmpty(personCheck.data.items)) {
            throw new Error(`The person with id ${workerPersId} was not found`);
        }

        const targetPersUserResp = await axios.get<
            FusionResponse<FusionUserAccount>
        >(
            `${libs.constants.actions.userAccounts}/?onlyData=true&q=PersonId=${workerPersId}`,
        );

        const targetUser = userCheck.data;
        const targetPerUsrAcct =
            targetPersUserResp.data.count === 1
                ? targetPersUserResp.data.items[0]
                : null;

        // set both account to have no person record
        await axios.patch(
            `${libs.constants.actions.userAccounts}/${targetUser.GUID}`,
            {
                PersonId: null,
            },
        );
        // only set this one to null if it isn't already null
        if (!_.isNil(targetPerUsrAcct)) {
            await axios.patch(
                `${libs.constants.actions.userAccounts}/${targetPerUsrAcct.GUID}`,
                {
                    PersonId: null,
                },
            );
        }
        // set the person record to the user account of the current user
        await axios.patch<FusionUserAccount>(
            `${libs.constants.actions.userAccounts}/${targetUser.GUID}`,
            {
                PersonId: workerPersId,
            },
        );

        // set the suspended flag of the user we just added this account to
        // as not suspenede
        const userResponse = await axios.patch<FusionUserAccount>(
            `${libs.constants.actions.userAccounts}/${targetUser.GUID}`,
            {
                SuspendedFlag: false,
            },
        );

        res.status(200).json(userResponse.data);
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
