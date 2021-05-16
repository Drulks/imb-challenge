const CONFIG = {
    PRODUCTION: process.env.NODE_ENV === 'production',
    AUTH_COOKIENAME: 'PF_T',
    JWT_PRIVATE_KEY: String(process.env.PRIVATE_KEY),
    SERVER_PORT: process.env.SERVER_PORT || 3000,
    API_IBGE: 'https://servicodados.ibge.gov.br/api/v1/',
    BD_BOOTSTRAP_MODE: "CREATE_IF_NOT_EXISTS" as ("WIPE_AND_CREATE" | "CREATE_IF_NOT_EXISTS")
}


export default CONFIG;