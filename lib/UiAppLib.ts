import axios, { AxiosInstance } from 'axios'

import FusionUserAccount from './models/fusion/FusionUserAccount'
import FusionWorker from './models/fusion/FusionWorker'

export default class UiAppLib {
    axiosLocalApi: AxiosInstance;

    constructor(private browserInstance: Window) {
        this.axiosLocalApi = axios.create({
            baseURL: `${this.browserInstance.location.href}/api`,
        });
    }

    async callSearchOracleUser(userName: string): Promise<FusionUserAccount> {
        const response = await this.axiosLocalApi.get<FusionUserAccount>(
            `/users/${userName}`,
        );
        return response.data;
    }

    async callGetWorkers(): Promise<FusionWorker[]> {
        const response = await this.axiosLocalApi.get<FusionWorker[]>(
            '/workers',
        );
        return response.data;
    }

    async callTieUserAndEmp({
        targetUserGuid,
        workerPersonId,
    }: {
        targetUserGuid: string | undefined;
        workerPersonId: string | undefined;
    }): Promise<FusionUserAccount> {
        const response = await this.axiosLocalApi.post('/users', {
            targetUserGuid,
            workerPersonId,
        });
        return response.data;
    }
}
