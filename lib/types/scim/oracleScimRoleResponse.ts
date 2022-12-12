import { oracleRole } from './OracleRole'

export interface OracleScimRoleResponse {
  itemsPerPage: number;
  startIndex: number;
  Resources: oracleRole[];
}
