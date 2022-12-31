import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'

export interface ICustomErrorProps<T> {
    axiosError?: AxiosError;
    httpConfig?: AxiosRequestConfig;
    response?: {
        status?: number;
        statusText?: string;
        data?: any;
    };
    message: string;
    stack?: string;
    name?: string;
}

export default class CustomError<T> implements ICustomErrorProps<T> {
    axiosError?: AxiosError<unknown, any>;
    response?: {
        status?: number;
        statusText?: string;
        data?: any;
    };
    message: string;
    stack?: string;
    name?: string;
    config?: AxiosRequestConfig;

    constructor({
        message,
        name,
        stack,
    }: {
        message: string;
        name?: string;
        stack?: string;
    }) {
        this.message = message;
        this.name = name;
        this.stack = stack;
    }

    public static CreateFromAxiosError<T>(err: AxiosError): CustomError<T> {
        const customError = new CustomError<T>({ ...err });
        customError.axiosError = err;
        customError.response = { data: err.response?.data, status: err.status };
        return customError;
    }

    public static Create<T>({
        config,
        error,
        response,
    }: {
        config?: AxiosRequestConfig<T>;
        error: Error;
        response?: AxiosResponse<T>;
    }): CustomError<T> {
        const customError = new CustomError<T>({ ...error });
        customError.config = config;
        customError.response = { ...response };
        return customError;
    }
}
