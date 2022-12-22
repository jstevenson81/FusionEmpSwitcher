/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    env: {
        POD_AUTH_USERNAME: 'LISA.JONES',
        POD_AUTH_PASSWORD: 'aCt3x#8#',
        POD_URL: 'https://fa-etas-dev21-saasfademo1.ds-fa.oraclepdemos.com',
        FUSION_ACTION_WORKERS: 'hcmRestApi/resources/11.13.18.05/workers',
        FUSION_ACTION_USER_ACCOUNTS:
            'hcmRestApi/resources/11.13.18.05/userAccounts',
        FUSION_QS_WORKER_NAME:
            'onlyData=true&fields=PersonNumber,PersonId;names:DisplayName&limit=500',
        FUSION_QS_USER_ACCOUNT:
            'onlyData=true&fields=PersonId,PersonNumber,UserId,Username,GUID&limit=500',
        ORDS_URL:
            'https://g6b2527b56da518-queryfinitedev.adb.us-ashburn-1.oraclecloudapps.com/ords/admin/ucsroles',
        LOCAL_ACTION_USER: 'api/users',
        LOCAL_ACTION_WORKERS: 'api/workers',
        LOCAL_ACTION_ROLES: 'api/roles',
    },
};

module.exports = nextConfig;
