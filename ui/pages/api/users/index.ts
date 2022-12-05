import axios from 'axios'
import _ from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'

import { actions, auth, OracleResponse, UserAccount } from './../../../lib/libsData'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserAccount | undefined | unknown>
) {
  axios.defaults.auth = { username: auth.userName, password: auth.password };

  try {
    if (req.method !== "POST")
      throw new Error(
        `${req.method} is not supported for this endpoint.  Please use a post`
      );
    const { userGuid, personId } = req.body;
    if (_.isNil(userGuid) || _.isNil(personId))
      throw new Error(
        'The request body must look like the following {"userGuid": string, "personId", number}'
      );

    const userCheck = await axios.get<UserAccount>(
      `${actions.userAccounts}/${userGuid}`
    );
    if (_.isNil(userCheck.data.GUID) || userCheck.data.GUID !== userGuid)
      throw new Error(`The user account GUID ${userGuid} was not found`);

    const personCheck = await axios.get<OracleResponse<Worker>>(
      `${actions.workers}/?q=PersonId=${personId}&fields=PersonId,PersonNumber`
    );
    if (_.isEmpty(personCheck.data.items)) {
      throw new Error(`The person with id ${personId} was not found`);
    }

    const targetPersUserResp = await axios.get<OracleResponse<UserAccount>>(
      `${actions.userAccounts}/?onlyData=true&q=PersonId=${personId}`
    );

    const targetUser = userCheck.data;
    const targetPerUsrAcct = targetPersUserResp.data.items[0];

    if (!_.isNil(targetPerUsrAcct.PersonId)) {
      // we have to null out the target person's user account
      await axios.patch(`${actions.userAccounts}/${targetPerUsrAcct.GUID}`, {
        PersonId: null,
      });
    }
    // set the person record to the user account of the current user
    const userResponse = await axios.patch(
      `${actions.userAccounts}/${targetUser.GUID}`,
      {
        PersonId: personId,
      }
    );

    res.status(200).json(userResponse);
  } catch (e) {
    res.status(400).json(e);
  }
}
