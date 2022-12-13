import axios, { AxiosResponse } from 'axios'
import _ from 'lodash'
import { cache } from 'react'

import { fusionUserAccount } from './types/fusion/restEntities/fusionUserAccount'
import { fusionWorker } from './types/fusion/restEntities/fusionWorker'

export default class LocalApiLib {
  constructor() {}

  async getWorkers(): Promise<fusionWorker[]> {
    const getWorkers = cache(
      async (): Promise<AxiosResponse<fusionWorker[]>> =>
        axios.get<fusionWorker[]>('api/workers')
    );
    const response = await getWorkers();
    return response.data;
  }

  async searchUser(userName: string): Promise<fusionUserAccount> {
    if (_.isEmpty(userName) || _.isNil(userName)) {
      throw new Error('Please enter a user account before searching');
    }
    if (!userName.endsWith('_ex')) {
      setUserNotFoundMsg(
        'You cannot search for a user account for a non-consultant user'
      );
      setLoading(false);
      return;
    }
    const response = await axios.get<fusionUserAccount>(
      `api/users/${userName}`
    );
    if (_.isNil(response.data.GUID))
      throw new Error(
        `A user with the user name of ${userName} was not found.`
      );
    return response.data;
  }

  async tieUserToEmp({
    userGuid,
    workerPersonId,
  }: {
    userGuid: string;
    workerPersonId: string;
  }): Promise<void> {
    const response = await axios.post('api/users', {
      userGuid: userGuid,
      workerPersId: workerPersonId,
    });
    return response.data;
  }
}
