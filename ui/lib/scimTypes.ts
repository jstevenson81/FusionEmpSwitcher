export interface OracleMeta {
  location: string;
  resourceType: string;
  created: string;
  lastModified: string;
}

export interface UcsRole {
  id: number | null;
  role_id: string;
  role_name: string;
  user_id: string;
  user_name: string;
}

export interface OrdsResponse<T> {
  items: T[];
}

export interface OracleMember {
  value: string;
}

export interface OracleRole {
  id: string;
  meta: OracleMeta;
  schemas: string[];
  name: string;
  displayName: string;
  description: string;
  category: string;
  members: OracleMember[];
  value: string;
}

export interface OracleScimRoleResponse {
  itemsPerPage: number;
  startIndex: number;
  Resources: OracleRole[];
}
