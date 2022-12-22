export default class AppUser {
    userName: string;
    userGuid: string;
    auth: boolean;

    constructor() {
        this.userGuid = '';
        this.auth = false;
        this.userName = '';
    }
}
