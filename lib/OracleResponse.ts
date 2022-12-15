export default class OracleResponse<T> {
  items: T[];
  hasMore: boolean;
  count: number;
  limit: number;
  offset: number;

  constructor() {
    this.count = 0;
    this.hasMore = false;
    this.items = [];
    this.limit = 0;
    this.offset = 0;
  }
}
