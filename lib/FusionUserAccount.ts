export default class FusionUserAccount {
  UserId: string;
  Username: string;
  PersonId: string;
  PersonNumber: string;
  GUID: string;
  SuspendedFlag: boolean;
  constructor() {
    this.GUID = '';
    this.PersonId = '';
    this.PersonNumber = '';
    this.SuspendedFlag = false;
    this.UserId = '';
    this.Username = '';
  }
}
