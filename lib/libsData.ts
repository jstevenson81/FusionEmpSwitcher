import axios, { AxiosError } from 'axios'
import _ from 'lodash'
import { NextApiResponse } from 'next'

interface oracleResponse<T> {
  items: T[];
  hasMore: boolean;
  count: number;
  limit: number;
  offset: number;
}

interface fusionWorkerName {
  FirstName: string;
  LastName: string;
  DisplayName: string;
}

interface fusionWorker {
  PersonNumber: string;
  PersonId: string;
  names: fusionWorkerName[];
}

interface fusionUserAccount {
  UserId: number;
  Username: string;
  PersonId: number;
  PersonNumber: string;
  GUID: string;
  SuspendedFlag: boolean;
}

const makeFusionUserAccount = (): fusionUserAccount => {
  return {
    PersonId: 0,
    PersonNumber: '',
    UserId: 0,
    Username: '',
    GUID: '',
    SuspendedFlag: false,
  };
};

const makeFusionWorker = (): fusionWorker => {
  return {
    PersonId: '',
    PersonNumber: '',
    names: [],
  };
};

const makeOracleResponse = <T>(items: Array<T> | null): oracleResponse<T> => {
  return {
    items: _.isNil(items) ? [] : Array.from(items),
    hasMore: false,
    count: 0,
    limit: 0,
    offset: 0,
  };
};

const auth = {
  userName: 'svc_sec_audit',
  password: 'C%KKKia9L*G@1gXxoxLlA%yk7*nX0p',
  podUrl: 'https://ewij-dev1.fa.us8.oraclecloud.com',
};

const actions = {
  workers: `${auth.podUrl}/hcmRestApi/resources/11.13.18.05/workers`,
  userAccounts: `${auth.podUrl}/hcmRestApi/resources/11.13.18.05/userAccounts`,
};

const filters = {
  workersName:
    '?onlyData=true&fields=PersonNumber,PersonId;names:DisplayName&limit=500',
  userAccountName:
    '?onlyData=true&fields=PersonId,PersonNumber,UserId,Username,GUID&limit=500',
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
  interfaces: {
    makeFusionUserAccount,
    makeOracleResponse,
    makeFusionWorkers: makeFusionWorker,
  },
  constants: {
    auth,
    actions,
    filters,
  },
  methods: {
    setUserAccountNameFilter,
    getQueryParamValue,
    makeAxiosErrorResponse,
    setAxiosDefaults,
  },
};
