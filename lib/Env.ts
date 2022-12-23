type Environment = 'dev' | 'test' | 'prod' | 'ci';
type actions = {
    local: {
        users: string;
        workers: string;
        roles: string;
    };
    oracle: { workers: string; userAccounts: string };
};
type auth = {
    oracle: { userName: string; password: string };
};
type urls = { oracle: string; ords: string };

export default class Env {
    // these are the strongly typed properties in each .env file
    actions: actions;
    auth: auth;
    urls: urls;

    constructor() {
        // create the config vars from the .env files
        this.actions = {
            local: {
                users: process.env.LOCAL_ACTION_USER!,
                workers: process.env.LOCAL_ACTION_WORKERS!,
                roles: process.env.LOCAL_ACTION_ROLES!,
            },
            oracle: {
                workers: process.env.FUSION_ACTION_WORKERS!,
                userAccounts: process.env.FUSION_ACTION_USER_ACCOUNTS!,
            },
        };
        this.auth = {
            oracle: {
                userName: process.env.POD_AUTH_USERNAME!,
                password: process.env.POD_AUTH_PASSWORD!,
            },
        };
        this.urls = {
            oracle: process.env.POD_URL!,
            ords: process.env.ORDS_URL!,
        };
    }
}
