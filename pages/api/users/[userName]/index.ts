import axios from 'axios'
import _ from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'

import { actions, auth, OracleResponse, setUserAccountNameFilter, UserAccount } from '../../../../lib/libsData'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserAccount | undefined | unknown>
) {
  axios.defaults.auth = { username: auth.userName, password: auth.password };

  try {
    const { userName } = req.query;
    if (_.isNil(userName))
      throw new Error(
        "The user name cannot be null or empty to search for a user account"
      );

    const filter = setUserAccountNameFilter(userName as string);

    let userAccountResp = await axios.get<OracleResponse<UserAccount>>(
      `${actions.userAccounts}${filter}`
    );
    res.status(200).json(_.first(userAccountResp.data.items));
  } catch (e) {
    res.status(400).json(e);
  }
}
