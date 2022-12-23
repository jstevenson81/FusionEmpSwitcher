import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import _ from 'lodash'

export interface ICustomErrorProps<T> {
    httpConfig: {
        baseURL?: string;
        url?: string;
        method?: string;
        params?: any;
        data?: any;
    };
    response: {
        status?: number;
        statusText?: string;
        data?: any;
    };
    message: string;
}

export default class CustomError<T> implements ICustomErrorProps<T> {
    message: string;
    httpConfig: {
        url?: string;
        baseURL?: string;
        method?: string;
        params?: any;
        data?: any;
    };
    response: {
        status?: number | undefined;
        statusText?: string;
        data?: any;
    };

    constructor(message: string) {
        this.message = message;

        this.httpConfig = {
            url: '',
            baseURL: '',
            method: '',
            params: {},
            data: {},
        };
        this.response = { status: 0, statusText: '', data: {} };
    }

    public static CreateFromAxiosError<T>(err: AxiosError): CustomError<T> {
        const customError = new CustomError<T>(err.message);
        customError.httpConfig.baseURL = err.config?.baseURL;
        customError.httpConfig.url = err.config?.url;
        customError.httpConfig.data = err.config?.data;
        customError.httpConfig.method = err.config?.method;
        customError.httpConfig.params = err.config?.data;
        customError.response.data = err.response?.data;
        customError.response.status = err.response?.status;
        customError.response.statusText = err.response?.statusText;
        return customError;
    }

    public static Create<T>({
        config,
        errMsg,
        response,
    }: {
        config: AxiosRequestConfig<T>;
        errMsg: string;
        response?: AxiosResponse<T>;
    }): CustomError<T> {
        const customError = new CustomError<T>(errMsg);
        customError.httpConfig.baseURL = config.baseURL;
        customError.httpConfig.url = config.url;
        customError.httpConfig.data = config.data;
        customError.httpConfig.method = config.method;
        customError.httpConfig.params = config.params;

        if (!_.isNil(response)) {
            customError.response.data = response.data;
            customError.response.status = response.status;
            customError.response.statusText = response.statusText;
        } else {
            customError.response = {};
        }
        return customError;
    }
}
