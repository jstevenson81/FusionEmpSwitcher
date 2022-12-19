import FusionUserRole from './fusion/FusionUserRole'
import OrdsRole from './ords/OrdsRole'

export default class UserRoles {
  dbRoles: OrdsRole[] | null;
  fusionRoles: FusionUserRole[] | null;
  userName: string;

  constructor() {
    this.dbRoles = [];
    this.fusionRoles = [];
    this.userName = '';
  }
}
