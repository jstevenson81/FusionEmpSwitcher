import _ from 'lodash'

export default class FusionResponse<T> {
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

  public static validateResponse<T>(
    response: FusionResponse<T>,
    shouldThrow: boolean = false
  ): boolean {
    if (
      _.isNil(response) ||
      _.isNil(response.items) ||
      _.isEmpty(response.items) ||
      response.count > 0
    ) {
      if (shouldThrow) {
        throw new Error(
          `The response ${JSON.stringify(response)} was not valid`
        );
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
}
