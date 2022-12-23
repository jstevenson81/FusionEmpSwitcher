/** @type {import('next').NextConfig} */

const {
    PHASE_DEVELOPMENT_SERVER,
    PHASE_PRODUCTION_BUILD,
} = require('next/constants');

// This uses phases as outlined here: https://nextjs.org/docs/#custom-configuration
module.exports = (phase) => {
    // when started in development mode `next dev` or `npm run dev` regardless of the value of STAGING environment variable
    const isDev = phase === PHASE_DEVELOPMENT_SERVER;
    // when `next build` or `npm run build` is used
    const isProd =
        phase === PHASE_PRODUCTION_BUILD && process.env.STAGING !== '1';
    // when `next build` or `npm run build` is used
    const isStaging =
        phase === PHASE_PRODUCTION_BUILD && process.env.STAGING === '1';

    console.log(`isDev:${isDev}  isProd:${isProd}   isStaging:${isStaging}`);

    const env = {
        POD_AUTH_USERNAME: (() => {
            return isDev ? 'LISA.JONES' : 'svc_audit';
        })(),
        POD_AUTH_PASSWORD: (() => {
            return isDev ? 'aCt3x#8#' : 'C%KKKia9L*G@1gXxoxLlA%yk7*nX0p';
        })(),
        POD_URL: (() => {
            return isDev
                ? 'https://fa-etas-dev21-saasfademo1.ds-fa.oraclepdemos.com'
                : 'https://ewij-dev3.fa.us8.oraclecloud.com';
        })(),
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
    };

    // next.config.js object
    return {
        env,
        reactStrictMode: true,
        swcMinify: true,
    };
};
