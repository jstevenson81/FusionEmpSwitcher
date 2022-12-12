import _ from 'lodash'

import constants from './constants'

const getQueryParamValue = (value: string | string[]): string => {
  const firstValue = Array.isArray(value) ? _.first(value) : value;
  return _.isUndefined(firstValue) ? '' : firstValue;
};

const setUserAccountNameFilter = (userName: string | string[]): string => {
  return `${constants.filters.userAccountName}&q=Username='${getQueryParamValue(
    userName
  )}'`;
};

const commonLib = {
  setUserAccountNameFilter,
  getQueryParamValue,
};

export default commonLib;
