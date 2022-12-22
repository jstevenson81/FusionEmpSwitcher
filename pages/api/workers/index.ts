// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import ApiAppLib from '../../../lib/ApiAppLib'
import FusionWorker from '../../../lib/models/fusion/FusionWorker'

import type { NextApiRequest, NextApiResponse } from 'next';
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<FusionWorker[]>,
) {
    const apiAppLib = new ApiAppLib();
    const workers = await apiAppLib.getAllWorkers();
    res.status(200).json(workers);
}
