export type OracleResponse<T> = {
  items: T[];
  hasMore: boolean;
  count: number;
  limit: number;
  offset: number;
};

export type WorkerName = {
  FirstName: string;
  LastName: string;
  DisplayName: string;
};

export type Worker = {
  PersonNumber: string;
  PersonId: string;
  names: WorkerName[];
};

export type UserAccount = {
  UserId: number;
  Username: string;
  PersonId: number;
  PersonNumber: string;
  GUID: string;
};

export const auth = {
  userName: "svc_sec_audit",
  password: "C%KKKia9L*G@1gXxoxLlA%yk7*nX0p",
  podUrl: "https://ewij-dev1.fa.us8.oraclecloud.com",
};

export const actions = {
  workers: `${auth.podUrl}/hcmRestApi/resources/11.13.18.05/workers`,
  userAccounts: `${auth.podUrl}/hcmRestApi/resources/11.13.18.05/userAccounts`,
};

export const filters = {
  workersName:
    "?onlyData=true&fields=PersonNumber,PersonId;names:DisplayName&limit=500",
  userAccountName:
    "?onlyData=true&fields=PersonId,PersonNumber,UserId,Username,GUID&limit=500",
};

export const setUserAccountNameFilter = (userName: string): string => {
  return `${filters.userAccountName}&q=Username='${userName}'`;
};
