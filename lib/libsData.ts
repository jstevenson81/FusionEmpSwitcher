import axios, { AxiosError } from 'axios'
import dotenv from 'dotenv'
import _ from 'lodash'
import { NextApiResponse } from 'next'

export class FusionUserAccount {
  UserId: string;
  Username: string;
  PersonId: string;
  PersonNumber: string;
  GUID: string;
  SuspendedFlag: boolean;
  constructor() {
    this.GUID = '';
    this.PersonId = '';
    this.PersonNumber = '';
    this.SuspendedFlag = false;
    this.UserId = '';
    this.Username = '';
  }
}

export class FusionWorker {
  PersonNumber: string;
  PersonId: string;
  names: FusionWorkerName[];

  constructor() {
    this.PersonId = '';
    this.PersonNumber = '';
    this.names = [];
  }
}

export class FusionWorkerName {
  FirstName: string;
  LastName: string;
  DisplayName: string;

  constructor() {
    this.DisplayName = '';
    this.FirstName = '';
    this.LastName = '';
  }
}

export class OracleResponse<T> {
  items: T[];
  hasMore: boolean;
  count: number;
  limit: number;
  offset: number;

  constructor() {
    this.count = 0;
    this.hasMore = false;
    this.items = [];
    this.limit = 0;
    this.offset = 0;
  }
}

export interface IValidEnvVariable {
  param: string;
  isValid: boolean;
}

export default class AppLib {
  public static validateEnv(param: string): string {
    dotenv.config();
    const validated = _.hasIn(process.env, param);
    if (validated === false)
      throw new Error(
        `The environment variable ${param} does not exist.  Please add ${param} as an environment variable`
      );
    if (_.isNil(process.env[param]))
      throw new Error(
        `The environment variable ${param} is not valued.  Please add a value for ${param}`
      );
    return process.env[param]!;
  }

  public static getAuth(): {
    userName: string;
    password: string;
    podUrl: string;
  } {
    return {
      userName: AppLib.validateEnv('fusionUserName'),
      password: AppLib.validateEnv('fusionUserPassword'),
      podUrl: AppLib.validateEnv('fusionPodUrl'),
    };
  }

  public static getActions(): {
    fusion: { workers: string; userAccounts: string };
    local: { users: string };
  } {
    return {
      fusion: {
        workers: AppLib.validateEnv('fusionActionWorkers'),
        userAccounts: AppLib.validateEnv('fusionActionUserAccounts'),
      },
      local: {
        users: AppLib.validateEnv('localActionsUsers'),
      },
    };
  }

  public static getFilters(): {
    fusion: { workersName: string; userAccounts: string };
  } {
    return {
      fusion: {
        workersName: AppLib.validateEnv('fusionFilterWorkerName'),
        userAccounts: AppLib.validateEnv('fusionFilterUserAccount'),
      },
    };
  }

  constructor() {}
}

const auth = {
  userName: 'lisa.jones',
  password: 'iXw5G?4^',
  podUrl: 'https://fa-etas-dev21-saasfademo1.ds-fa.oraclepdemos.com',
};

const actions = {
  fusion: {
    workers: `${auth.podUrl}/hcmRestApi/resources/11.13.18.05/workers`,
    userAccounts: `${auth.podUrl}/hcmRestApi/resources/11.13.18.05/userAccounts`,
  },
  local: {
    users: 'api/users',
  },
};

const filters = {
  workersName:
    '?onlyData=true&fields=PersonNumber,PersonId;names:DisplayName&limit=500',
  userAccountName:
    '?onlyData=true&fields=PersonId,PersonNumber,UserId,Username,GUID&limit=500',
};

const makeFusionUserAccount = (): FusionUserAccount => {
  return {
    PersonId: 0,
    PersonNumber: '',
    UserId: 0,
    Username: '',
    GUID: '',
    SuspendedFlag: false,
  };
};

const makeFusionWorker = (): FusionWorker => {
  return {
    PersonId: '',
    PersonNumber: '',
    names: [],
  };
};

const makeOracleResponse = <T>(items: Array<T> | null): OracleResponse<T> => {
  return {
    items: _.isNil(items) ? [] : Array.from(items),
    hasMore: false,
    count: 0,
    limit: 0,
    offset: 0,
  };
};

const runUserNameSearch = async (
  userName: string
): Promise<fusionUserAccount> => {
  const userResp = await axios.get<fusionUserAccount>(
    `${actions.local.users}/${userName}`
  );

  if (_.isNil(userResp.data.GUID)) {
    throw new Error(`A user with the user name of ${userName} was not found.`);
  } else {
    return userResp.data;
  }
};

const tieUserAndEmp = async ({
  userGuid,
  workerPersonId,
}: {
  userGuid: string | undefined;
  workerPersonId: string | undefined;
}): Promise<fusionUserAccount> => {
  const response = await axios.post<fusionUserAccount>('api/users', {
    userGuid: userGuid,
    workerPersId: workerPersonId,
  });
  return response.data;
};

const setUserAccountNameFilter = (userName: string): string => {
  return `${filters.userAccountName}&q=Username='${userName}'`;
};

const getQueryParamValue = (value: string | string[]): string => {
  const firstValue = Array.isArray(value) ? _.first(value) : value;
  return _.isUndefined(firstValue) ? '' : firstValue;
};

const makeAxiosErrorResponse = ({
  e,
  res,
}: {
  e: any;
  res: NextApiResponse;
}): void => {
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
};

const setAxiosDefaults = (): void => {
  axios.defaults.auth = {
    username: auth.userName,
    password: auth.password,
  };
};

export default {
  constants: {
    auth,
    actions,
    filters,
  },
  methods: {
    makeFusionUserAccount,
    makeOracleResponse,
    makeFusionWorker,
    setUserAccountNameFilter,
    getQueryParamValue,
    makeAxiosErrorResponse,
    setAxiosDefaults,
    localApi: {
      runUserNameSearch,
      tieUserAndEmp,
    },
  },
};
