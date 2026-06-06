const mysql = require('mysql2/promise');

let poolPromise;

const initializePool = async () => {

    const host = process.env.MYSQL_HOST;
    const port = Number(process.env.MYSQL_PORT);
    const user = process.env.MYSQL_USER;
    const password = process.env.MYSQL_PASSWORD;
    const database = process.env.MYSQL_DATABASE;

    try {
        const boot = await mysql.createConnection({ host, port, user, password });
        await boot.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
        await boot.end();
    } catch (e) {
        console.log(e);
    }

    return mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 5000
    });
};

const getPool = async () => {
    if (!poolPromise) {
        poolPromise = initializePool();
    }
    return poolPromise;
};

module.exports = {
    query: async (...args) => {
        const pool = await getPool();
        return pool.query(...args);
    },
    execute: async (...args) => {
        const pool = await getPool();
        return pool.execute(...args);
    },
    getConnection: async () => {
        const pool = await getPool();
        return pool.getConnection();
    },
    getPool
};