import { AxiosError } from 'axios'
import _ from 'lodash'
import { NextApiResponse } from 'next'

import constants from './constants'

const getQueryParamValue = (value: string | string[]): string => {
  const firstValue = Array.isArray(value) ? _.first(value) : value;
  return _.isUndefined(firstValue) ? '' : firstValue;
};

const setUserAccountNameFilter = (userName: string | string[]): string => {
  return `${constants.filters.userAccountName}&q=Username='${getQueryParamValue(
    userName
  )}'`;
};

const makeAxiosErrorResponse = ({
  e,
  res,
}: {
  e: any;
  res: NextApiResponse;
}): void => {
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
};

const commonLib = {
  setUserAccountNameFilter,
  getQueryParamValue,
  makeAxiosErrorResponse,
};

export default commonLib;
