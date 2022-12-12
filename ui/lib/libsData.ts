import _ from 'lodash'

export type OracleResponse<T> = {
  items: T[];
  hasMore: boolean;
  count: number;
  limit: number;
  offset: number;
};

export type PodWorkername = {
  FirstName: string;
  LastName: string;
  DisplayName: string;
};

export type PodWorker = {
  PersonNumber: string;
  PersonId: string;
  names: PodWorkername[];
};

export type PodUserAccount = {
  UserId: number;
  Username: string;
  PersonId: number;
  PersonNumber: string;
  GUID: string;
  SuspendedFlag: boolean;
};

export type AppUser = {
  userName: string;
  userGuid: string;
  auth: boolean;
};

export const auth = {
  userName: 'svc_sec_audit',
  password: 'C%KKKia9L*G@1gXxoxLlA%yk7*nX0p',
  podUrl: 'https://ewij-dev1.fa.us8.oraclecloud.com',
  ordsUrl:
    'https://g6b2527b56da518-queryfinitedev.adb.us-ashburn-1.oraclecloudapps.com/ords/admin',
};

export const actions = {
  fusion: {
    workers: `${auth.podUrl}/hcmRestApi/resources/11.13.18.05/workers`,
    userAccounts: `${auth.podUrl}/hcmRestApi/resources/11.13.18.05/userAccounts`,
    roles: `${auth.podUrl}/hcmRestApi/scim/roles`,
  },
  ords: {
    ucsRoles: `${auth.ordsUrl}/ucsroles`,
  },
};

export const filters = {
  workersName:
    '?onlyData=true&fields=PersonNumber,PersonId;names:DisplayName&limit=500',
  userAccountName:
    '?onlyData=true&fields=PersonId,PersonNumber,UserId,Username,GUID&limit=500',
};

export const setUserAccountNameFilter = (
  userName: string | string[]
): string => {
  const filterUserName = Array.isArray(userName) ? _.first(userName) : userName;
  return `${filters.userAccountName}&q=Username='${filterUserName}'`;
};
