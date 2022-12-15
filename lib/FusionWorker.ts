import FusionWorkerName from './FusionWorkerName'

export default class FusionWorker {
  PersonNumber: string;
  PersonId: string;
  names: FusionWorkerName[];

  constructor() {
    this.PersonId = '';
    this.PersonNumber = '';
    this.names = [];
  }
}
