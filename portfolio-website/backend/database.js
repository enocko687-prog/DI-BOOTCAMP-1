"use strict";

require("dotenv").config();

let sql;
let poolPromise;

function getSqlDriver() {
    if (!sql) {
        sql = process.env.DB_USER
            ? require("mssql")
            : require("mssql/msnodesqlv8");
    }

    return sql;
}

function getPool() {
    if (!poolPromise) {
        const driver = getSqlDriver();
        const integratedAuthentication = !process.env.DB_USER;
        const options = {
            encrypt: process.env.DB_ENCRYPT === "true",
            trustServerCertificate: process.env.DB_TRUST_CERT === "true"
        };

        if (process.env.DB_INSTANCE) {
            options.instanceName = process.env.DB_INSTANCE;
        }

        const config = {
            server: process.env.DB_SERVER || "localhost",
            database: process.env.DB_NAME || "EnockPortfolioDB",
            connectionTimeout: 15000,
            requestTimeout: 15000,
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000
            },
            options
        };

        if (integratedAuthentication) {
            config.driver = process.env.DB_ODBC_DRIVER || "ODBC Driver 18 for SQL Server";
            config.options = {
                ...options,
                trustedConnection: true
            };
        } else {
            config.user = process.env.DB_USER;
            config.password = process.env.DB_PASSWORD || "";
        }

        poolPromise = new driver.ConnectionPool(config)
            .connect()
            .catch((error) => {
                poolPromise = undefined;
                throw error;
            });
    }

    return poolPromise;
}

async function closePool() {
    if (poolPromise) {
        const activePool = await poolPromise.catch(() => null);
        poolPromise = undefined;

        if (activePool) {
            await activePool.close();
        }
    }
}

module.exports = {
    getPool,
    getSqlDriver,
    closePool
};
