import { AxiosError } from 'axios'
import { NextApiResponse } from 'next'

export default function HandleAxiosErrorResponse({
  e,
  res,
}: {
  e: any;
  res: NextApiResponse;
}): void {
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
