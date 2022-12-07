import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

import { auth, UserAccount } from '../../../lib/libsData'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserAccount | undefined | unknown>
) {
  axios.defaults.auth = { username: auth.userName, password: auth.password };

  const getRole = async(): Promise<



  
}