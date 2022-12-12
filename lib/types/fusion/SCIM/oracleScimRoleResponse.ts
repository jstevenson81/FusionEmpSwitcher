import { oracleRole } from './oracleRole'

export interface oracleScimRoleResponse {
  itemsPerPage: number;
  startIndex: number;
  Resources: oracleRole[];
}
