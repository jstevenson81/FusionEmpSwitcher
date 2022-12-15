import axios, { AxiosError, AxiosInstance } from 'axios'
import _ from 'lodash'
import { NextApiResponse } from 'next'

import Env from './Env'
import FusionUserAccount from './FusionUserAccount'

export default class AppLib {
  public static getQueryParamValue(value: string | string[]): string {
    const firstValue = Array.isArray(value) ? _.first(value) : value;
    return _.isUndefined(firstValue) ? '' : firstValue;
  }

  public static makeAxiosErrorResponse({
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

  env: Env;
  axios: AxiosInstance;
  constructor() {
    this.env = new Env();
    this.axios = axios.create({
      baseURL: this.env.auth.remote.url,
      auth: {
        username: this.env.auth.remote.userName,
        password: this.env.auth.remote.password,
      },
    });
  }

  public async runUserNameSearch(userName: string): Promise<FusionUserAccount> {
    const userResp = await this.axios.get<FusionUserAccount>(
      `${this.env.actions.local.users}/${userName}`
    );

    if (_.isNil(userResp.data.GUID)) {
      throw new Error(
        `A user with the user name of ${userName} was not found.`
      );
    } else {
      return userResp.data;
    }
  }

  public async tieUserAndEmp({
    userGuid,
    workerPersonId,
  }: {
    userGuid: string | undefined;
    workerPersonId: string | undefined;
  }): Promise<FusionUserAccount> {
    const response = await this.axios.post<FusionUserAccount>('api/users', {
      userGuid: userGuid,
      workerPersId: workerPersonId,
    });
    return response.data;
  }

  public setUserAccountNameFilter(userName: string): string {
    return `${this.env.filters.remote.userAccountName}&q=Username='${userName}'`;
  }
}
