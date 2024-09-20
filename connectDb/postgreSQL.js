const { Pool } = require('pg'); 

const poolPostgreSQL = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'node_practice',
    password: '123456',
    port: 5433,
});


module.exports = {
    poolPostgreSQL
};