const CONFIG = {
    PRODUCTION: process.env.NODE_ENV === 'production',
    AUTH_COOKIENAME: 'PF_T',
    JWT_PRIVATE_KEY: String(process.env.PRIVATE_KEY),
    SERVER_PORT: process.env.SERVER_PORT || 3000,
}


export default CONFIG;