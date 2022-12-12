import axios from 'axios'
import _ from 'lodash'

import { actions, auth, filters } from '../../../lib/commonLib'
import HandleAxiosErrorResponse from '../../../lib/errorHandlerAxios'
import { OracleResponse } from '../../../lib/types/oracleResponse'

import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Worker[]>
) {
  try {
    axios.defaults.auth = { username: auth.userName, password: auth.password };
    const workerAction = `${actions.workers}${filters.workersName}`;
    let workerResp = await axios.get<OracleResponse<Worker>>(workerAction);
    let offset = 500;
    let looped = 1;
    let workers = workerResp.data.items;

    while (workerResp.data.hasMore) {
      workerResp = await axios.get<OracleResponse<Worker>>(
        `${actions.workers}${filters.workersName}&offset=${offset * looped}`
      );

      workers = _.concat(workers, workerResp.data.items);
      looped += 1;
    }

    res.status(200).json(workers);
  } catch (e) {
    HandleAxiosErrorResponse({ e, res });
  }
}
