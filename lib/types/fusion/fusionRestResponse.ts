import { oracleItemResponse } from './../oracleItemResponse'

export interface fusionRestResponse<T> extends oracleItemResponse<T> {
  hasMore: boolean;
  count: number;
  limit: number;
  offset: number;
}
