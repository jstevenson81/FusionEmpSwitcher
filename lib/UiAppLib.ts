import axios, { AxiosInstance } from 'axios'

import FusionUserAccount from './models/fusion/FusionUserAccount'
import FusionWorker from './models/fusion/FusionWorker'

export default class UiAppLib {
    axiosLocalApi: AxiosInstance;

    constructor() {
        this.axiosLocalApi = axios.create({ baseURL: '/api' });
    }

    async searchOracleUser(userName: string): Promise<FusionUserAccount> {
        const response = await this.axiosLocalApi.get<FusionUserAccount>(
            `/users/${userName}`,
        );
        return response.data;
    }

    async getUsers(): Promise<FusionWorker[]> {
        const response = await this.axiosLocalApi.get<FusionWorker[]>(
            '/workers',
        );
    }
}
