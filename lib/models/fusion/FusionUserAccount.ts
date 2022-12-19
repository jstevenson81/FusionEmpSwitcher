import _ from 'lodash'

import FusionUserLink from './FusionUserLink'

export default class FusionUserAccount {
  UserId: string;
  Username: string;
  PersonId: string;
  PersonNumber: string;
  GUID: string;
  SuspendedFlag: boolean;
  links: FusionUserLink[];
  constructor() {
    this.GUID = '';
    this.PersonId = '';
    this.PersonNumber = '';
    this.SuspendedFlag = false;
    this.UserId = '';
    this.Username = '';
    this.links = [];
  }

  public static getUserAccountLink(
    links: FusionUserLink[]
  ): FusionUserLink | null {
    const roleLink = _.find(links, (link: FusionUserLink) => {
      return link.name === 'userAccountRoles';
    });
    return _.isUndefined(roleLink) ? null : roleLink;
  }
}
