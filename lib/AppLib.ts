import axios, { AxiosError, AxiosInstance } from 'axios'
import _ from 'lodash'
import { NextApiResponse } from 'next'

import Env from './Env'
import FusionResponse from './models/fusion/FusionResponse'
import FusionUserAccount from './models/fusion/FusionUserAccount'
import FusionUserRole from './models/fusion/FusionUserRole'
import FusionWorker from './models/fusion/FusionWorker'
import OrdsRole from './models/ords/OrdsRole'
import UserRoles from './models/UserRoles'

export type oracleParams = {
    onlyData: boolean;
    limit: number;
    q?: string | null;
    fields: string | null;
};

export default class AppLib {
    //#region static methods
    public static getQueryParamValue(
        value: string | string[] | undefined,
    ): string {
        if (_.isUndefined(value)) return '';
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
    public static getOracleUserNameSearchParams({
        userName,
        onlyData,
    }: {
        userName: string;
        onlyData: boolean;
    }): oracleParams {
        return {
            q: `Username eq '${userName}'`,
            fields: 'PersonId,PersonNumber,UserId,Username,GUID',
            onlyData,
            limit: 500,
        };
    }
    public static getOracleWorkerSearchParams(): oracleParams {
        return {
            fields: 'PersonNumber,PersonId;names:DisplayName',
            onlyData: true,
            limit: 500,
        };
    }

    //#endregion

    env: Env;
    axiosOracle: AxiosInstance;
    axiosOrds: AxiosInstance;
    constructor() {
        this.env = new Env();
        this.axiosOracle = axios.create({
            baseURL: this.env.urls.oracle,
            auth: {
                username: this.env.auth.oracle.userName,
                password: this.env.auth.oracle.password,
            },
        });
        this.axiosOrds = axios.create({
            baseURL: this.env.urls.ords,
        });
    }

    public async getOracleUser(userName: string): Promise<FusionUserAccount> {
        const params = AppLib.getOracleUserNameSearchParams({
            userName,
            onlyData: false,
        });
        const userResp = await this.axiosOracle.get<FusionUserAccount>(
            this.env.actions.oracle.userAccounts,
            { params },
        );

        if (_.isNil(userResp.data.GUID)) {
            throw new Error(
                `A user with the user name of ${userName} was not found.`,
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
        const response = await this.axiosOracle.post<FusionUserAccount>(
            'api/users',
            {
                userGuid: userGuid,
                workerPersId: workerPersonId,
            },
        );
        return response.data;
    }

    public async getFusionUserByGuid(
        guid: string,
    ): Promise<FusionUserAccount | null> {
        const userResponse = await this.axiosOracle.get<
            FusionResponse<FusionUserAccount>
        >(`${this.env.actions.oracle.userAccounts}/${guid}`, {
            params: { onlyData: true },
        });

        if (userResponse && userResponse.data && userResponse.data.count > 0) {
            const user = _.first(userResponse.data.items);
            return !_.isNil(user) ? user : null;
        }
        throw new Error(
            `There were no users returned from the call to ${this.env.actions.oracle.userAccounts}/${guid}`,
        );
    }

    public async getWorkerByPersonId(
        workerPersId: string,
    ): Promise<FusionWorker> {
        const response = await this.axiosOracle.get<
            FusionResponse<FusionWorker>
        >(this.env.actions.oracle.workers, {
            params: {
                q: `PersonId eq ${workerPersId}`,
                fields: 'PersonId,PersonNumber',
            },
        });
    }

    public async getUserRoles(userName: string): Promise<UserRoles> {
        const oracleUserResp = await this.axiosOracle.get<
            FusionResponse<FusionUserAccount>
        >(this.env.actions.oracle.userAccounts, {
            params: AppLib.getOracleUserNameSearchParams({
                userName,
                onlyData: false,
            }),
        });

        FusionResponse.validateResponse(oracleUserResp.data, true);
        const roleLink = FusionUserAccount.getUserAccountLink(
            oracleUserResp.data.items[0].links,
        );
        let oraRoleData = new FusionResponse<FusionUserRole>();
        if (!_.isNil(roleLink)) {
            const oraRoleResponse = await this.axiosOracle.get<
                FusionResponse<FusionUserRole>
            >(roleLink.href);
            FusionResponse.validateResponse(oraRoleResponse.data, true);
            oraRoleData = oraRoleResponse.data;
        }
        const dbRoleResponse = await this.axiosOrds.get<
            FusionResponse<OrdsRole>
        >('/', { params: { q: `{"user_name":"${userName}}"}` } });
        const dbRespValid = FusionResponse.validateResponse(
            dbRoleResponse.data,
            false,
        );
        const userRoles = new UserRoles();
        userRoles.dbRoles = dbRespValid ? dbRoleResponse.data.items : null;
        userRoles.fusionRoles = oraRoleData.items;
        userRoles.userName = userName;

        return userRoles;
    }
}
