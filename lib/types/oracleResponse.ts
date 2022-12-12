export type OracleResponse<T> = {
  items: T[];
  hasMore: boolean;
  count: number;
  limit: number;
  offset: number;
};
