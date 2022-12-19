export default class FusionUserRole {
  UserRoleId: number;
  RoleId: number;
  RoleCode: string;
  CreatedBy: string;
  CreationDate: string;
  LastUpdatedBy: string;
  LastUpdateDate: string;

  constructor() {
    this.CreatedBy = '';
    this.CreationDate = '';
    this.LastUpdateDate = '';
    this.LastUpdatedBy = '';
    this.RoleCode = '';
    this.RoleId = 0;
    this.UserRoleId = 0;
  }
}
