import { oracleMember } from './oracleMember'
import { oracleMeta } from './oracleMeta'

export interface oracleRole {
  id: string;
  meta: oracleMeta;
  schemas: string[];
  name: string;
  displayName: string;
  description: string;
  category: string;
  members: oracleMember[];
  value: string;
}
