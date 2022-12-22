import _ from 'lodash'

type Environment = 'dev' | 'test' | 'prod' | 'ci';
type actions = {
    local: { users: string; workers: string; roles: string };
    oracle: { workers: string; userAccounts: string };
};
type auth = { oracle: { userName: string; password: string } };
type urls = { oracle: string; ords: string };

export default class Env {
    // these are the strongly typed properties in each .env file
    actions: actions;
    auth: auth;
    urls: urls;

    private dotEnvDefault = '.env';
    private dotEnvTest = '.env.test';
    private dotEnvDev = '.env.dev';
    private dotEnvProd = '.env.prod';
    constructor() {
        // create the config vars from the .env files
        this.actions = {
            local: {
                users: this.getEnvVariable('LOCAL_ACTION_USER'),
                workers: this.getEnvVariable('LOCAL_ACTION_WORKERS'),
                roles: this.getEnvVariable('LOCAL_ACTION_ROLES'),
            },
            oracle: {
                workers: this.getEnvVariable('FUSION_ACTION_WORKERS'),
                userAccounts: this.getEnvVariable(
                    'FUSION_ACTION_USER_ACCOUNTS',
                ),
            },
        };
        this.auth = {
            oracle: {
                userName: this.getEnvVariable('POD_AUTH_USERNAME'),
                password: this.getEnvVariable('POD_AUTH_PASSWORD'),
            },
        };
        this.urls = {
            oracle: this.getEnvVariable('POD_URL'),
            ords: this.getEnvVariable('ORDS_URL'),
        };
    }
    private getEnvVariable(name: string): string {
        const theValue = process.env[name];
        return _.isUndefined(theValue) ? '' : theValue;
    }
}
