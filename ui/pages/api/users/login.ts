import _ from 'lodash'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authErrorStatement = "UNAUTH";

  try {
    if (req.method !== "POST")
      throw new Error(
        `The method ${req.method} is not supported for this endpoint.  Please use POST`
      );
    const { userName, password } = req.body;
    if (_.isNil(userName) || _.isNil(password))
      throw new Error(authErrorStatement);

    if (userName === "test" && password === "test") {
      res.status(200).json({ message: "AUTHORIZED" });
    } else {
      throw new Error(authErrorStatement);
    }
  } catch (e) {
    const err = e as Error;
    if (err.message === authErrorStatement) {
      res.status(401).json({ message: "Unauthorized" });
    }
  }
}
