import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import _ from 'lodash'
import { NextApiResponse } from 'next'

import CustomError from './CustomError'
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

export default class ApiAppLib {
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
        const customErr = e as CustomError<any>;
        const axiosErr = e as AxiosError;
        console.log(customErr);
        console.log(axiosErr);
        return axios.isAxiosError(e)
            ? res.status(400).json(CustomError.CreateFromAxiosError(axiosErr))
            : res.status(400).json(
                  CustomError.Create<any>({
                      config: customErr.httpConfig,
                      errMsg: customErr.message,
                  }),
              );
    }
    public static getOracleUserNameSearchParams({
        userName,
        onlyData,
    }: {
        userName: string;
        onlyData: boolean;
    }): oracleParams {
        return {
            q: `Username='${userName}'`,
            fields: 'PersonId,PersonNumber,UserId,Username,GUID',
            onlyData,
            limit: 500,
        };
    }
    public static getOracleWorkerSearchParams({
        onlyData,
    }: {
        onlyData: boolean;
    }): oracleParams {
        return {
            fields: 'PersonNumber,PersonId;names:DisplayName',
            onlyData,
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
                username: this.env.auth.oracle.userName!,
                password: this.env.auth.oracle.password!,
            },
        });
        this.axiosOrds = axios.create({
            baseURL: this.env.urls.ords,
        });
    }

    public async getOracleUser(userName: string): Promise<FusionUserAccount> {
        const params = ApiAppLib.getOracleUserNameSearchParams({
            userName,
            onlyData: false,
        });
        const userReq: AxiosRequestConfig = {
            url: this.env.actions.oracle.userAccounts,
            data: { params },
            method: 'GET',
        };
        const userResp = await this.axiosOracle<
            FusionResponse<FusionUserAccount>
        >(userReq);
        if (userResp.data.count > 1) {
            throw CustomError.Create({
                errMsg: `Searching for ${userName} returned more than one result`,
                config: userReq,
                response: userResp,
            });
        }
        const user = _.first(userResp.data.items);
        if (_.isNil(user)) {
            throw CustomError.Create({
                errMsg: `${userName} was not found`,
                config: userReq,
                response: userResp,
            });
        } else {
            return user;
        }
    }

    public async tieUserAndEmp({
        targetUserGuid,
        workerPersonId,
    }: {
        targetUserGuid: string | undefined;
        workerPersonId: string | undefined;
    }): Promise<FusionUserAccount> {
        // validate the params passed
        if (_.isNil(targetUserGuid) || _.isNil(workerPersonId))
            throw new Error(
                'The request body must have a targetUserGuid and workerPersonId property to call this method.',
            );

        // make sure we can get the user from the pod
        const userAccount = await this.getFusionUserByGuid(targetUserGuid);
        if (
            _.isNil(userAccount) ||
            _.isNil(userAccount.GUID) ||
            userAccount.GUID !== targetUserGuid
        )
            throw new Error(
                `The user account GUID ${targetUserGuid} was not found`,
            );

        // make sure we can get the worker from the pod
        const workerRecord = await this.getWorkerByPersonId(workerPersonId);
        if (_.isEmpty(workerRecord)) {
            throw new Error(
                `The person with id ${workerPersonId} was not found`,
            );
        }

        // step 1: set the person id of the target user to null
        await this.axiosOracle.patch(
            `this.env.actions.oracle.userAccounts/${userAccount.GUID}`,
            { PersonId: null },
        );
        // step 2:  set the person id of the target user to the person id of the passed in user
        await this.axiosOracle.patch(
            `this.env.actions.oracle.userAccounts/${userAccount.GUID}`,
            { PersonId: workerRecord.PersonId },
        );
        // step 3:  set the suspended flag to false
        const response = await this.axiosOracle.patch<FusionUserAccount>(
            `this.env.actions.oracle.userAccounts/${userAccount.GUID}`,
            { SuspendedFlag: false },
        );
        // step 4: return the user account
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
        const params = ApiAppLib.getOracleWorkerSearchParams({
            onlyData: true,
        });
        params.q = `PersonId eq ${workerPersId}`;

        const response = await this.axiosOracle.get<
            FusionResponse<FusionWorker>
        >(this.env.actions.oracle.workers!, { params });
        FusionResponse.validateResponse(response.data, true);
        return response.data.items[0];
    }

    public async getUserRoles(userName: string): Promise<UserRoles> {
        const oracleUserResp = await this.axiosOracle.get<
            FusionResponse<FusionUserAccount>
        >(this.env.actions.oracle.userAccounts!, {
            params: ApiAppLib.getOracleUserNameSearchParams({
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
            >(`${roleLink.href}?onlyData=true&fields=RoleId,RoleCode`);
            FusionResponse.validateResponse(oraRoleResponse.data, true);
            oraRoleData = oraRoleResponse.data;
        }
        const dbRoleResponse = await this.axiosOrds.get<
            FusionResponse<OrdsRole>
        >('/', { params: { q: `{"user_name":"${userName}"}` } });

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

    public async getAllWorkers(): Promise<FusionWorker[]> {
        const workerAction = `${
            this.env.actions.oracle.workers
        }${ApiAppLib.getOracleWorkerSearchParams({ onlyData: true })}`;
        let workerResp = await axios.get<FusionResponse<FusionWorker>>(
            workerAction,
        );
        let offset = 500;
        let looped = 1;
        let workers = workerResp.data.items;

        while (workerResp.data.hasMore) {
            workerResp = await axios.get<FusionResponse<FusionWorker>>(
                `${workerAction}&offset=${offset * looped}`,
            );
            workers = _.concat(workers, workerResp.data.items);
            looped += 1;
        }
        return workers;
    }
}
