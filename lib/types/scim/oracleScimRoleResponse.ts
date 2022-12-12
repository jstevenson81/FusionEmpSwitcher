import { oracleRole } from './OracleRole'

export interface oracleScimRoleResponse {
  itemsPerPage: number;
  startIndex: number;
  Resources: oracleRole[];
}
