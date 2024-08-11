const { Pool } = require('pg'); 

const poolPostgreSQL = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'node_practice',
    password: 'mamasin88',
    port: 5433,
});


module.exports = {
    poolPostgreSQL
};