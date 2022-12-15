import dotenv from 'dotenv'
import fs from 'fs'
import _ from 'lodash'
import path from 'path'

type Environment = 'dev' | 'test' | 'prod' | 'ci';
type configItem = { local: any; remote: any };

export default class Env {
  // these are the strongly typed properties in each .env file
  actions: configItem;
  filters: configItem;
  auth: configItem;

  private dotEnvDefault = '.env';
  private dotEnvTest = '.env.test';
  private dotEnvDev = '.env.dev';
  private dotEnvProd = '.env.prod';
  constructor() {
    // configure dotenv to resolve a file named ".env.dev"
    // found in the currrent working directory
    dotenv.config({
      path: path.resolve(process.cwd(), this.dotEnvDev),
    });
    this.init();

    // create the config vars from the .env files
    this.actions = {
      local: {
        users: this.getEnvironmentVariable('LOCAL_ACTION_USER'),
        workers: this.getEnvironmentVariable('LOCAL_ACTION_WORKERS'),
        roles: this.getEnvironmentVariable('LOCAL_ACTION_ROLES'),
      },
      remote: {
        workers: this.getEnvironmentVariable('FUSION_ACTION_WORKERS'),
        userAccounts: this.getEnvironmentVariable(
          'FUSION_ACTION_USER_ACCOUNTS'
        ),
      },
    };
    this.filters = {
      local: {},
      remote: {
        workerName: this.getEnvironmentVariable('FUSION_FILTER_WORKER_NAME'),
        userAccount: this.getEnvironmentVariable('FUSION_FILTER_USER_ACCOUNT'),
      },
    };
    this.auth = {
      local: {},
      remote: {
        userName: this.getEnvironmentVariable('POD_AUTH_USERNAME'),
        password: this.getEnvironmentVariable('POD_AUTH_PASSWORD'),
        url: this.getEnvironmentVariable('POD_AUTH_URL'),
      },
    };
  }
  init() {
    // first, ensure a .env file xists
    if (!fs.existsSync(this.dotEnvDefault)) {
      throw new Error(
        'Please add a .env file to the root directory with a NODE_ENV value'
      );
    }
    // then configure dotenv with the configuration in the .env file
    dotenv.config({
      path: path.resolve(process.cwd(), this.dotEnvDefault),
    });
    // and get the environment specified
    const environment = this.getEnvironment() ?? 'dev';
    // then load the name of the environment file
    const envFile = this.getEnvFile(environment);
    // and re-configure dotenv
    dotenv.config({
      path: path.resolve(process.cwd(), envFile),
    });
  }
  getEnvFile(environment: Environment): string {
    switch (environment) {
      case 'dev':
        return this.dotEnvDev;
      case 'test':
      case 'ci':
        return this.dotEnvTest;
      case 'prod':
        return this.dotEnvProd;
      default:
        return this.dotEnvDefault;
    }
  }
  // Get a value from the .env.* file
  getEnvironmentVariable(variable: string): string {
    const envVar = process.env[variable];
    return _.isNil(envVar) ? '' : envVar;
  }
  // Get the current environment. Can be null.
  getEnvironment(): Environment | null {
    return this.getEnvironmentVariable('NODE_ENV') as Environment;
  }
  isDevelopment() {
    return this.getEnvironment() === 'dev';
  }
  isTest() {
    return this.getEnvironment() === 'test';
  }
  isProd() {
    return this.getEnvironment() === 'prod';
  }
}
