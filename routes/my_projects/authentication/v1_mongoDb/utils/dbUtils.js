const { Pool } = require('pg');
// const jwt = require('jsonwebtoken');


const dbConnect = {
    userPool: new Pool({
      user: 'postgres',
      password: 'maMAsin88$',
      host: 'localhost',
      database: 'postgres',
      port: '5433',
    })
}

class DbHandler {
  constructor(pull){
    this.pool = pull
  }

  async query(sql, values){
    try {
      const client = await this.pool.connect();
      const result = await client.query(sql, values);
      client.release();
      return result.rows;
    }catch(err){
      console.error('Error executing query:', err);
      throw err
    }
  }
  //SELECT * FROM users WHERE age > $1 AND country = $2
  async select(table, selectItems, conditions, values){
      // const keys = Object.keys(conditions);
      // const values = Object.keys(conditions);
      // const placeholders = keys.map((key, index) => `${key} ${conditions} $${index + 1}`).join(' AND ');
      // const sql = `SELECT ${selectItems} FROM ${table} WHERE ${data}`
      let sql
      if(!conditions){
        sql = `SELECT ${selectItems} FROM ${table}`
          
      }else{
        sql = `SELECT ${selectItems} FROM ${table} WHERE ${data}`
      }
      return this.query(sql, values);
  }
      


  async insert(table, data){
    const keys = Object.keys(data);//Возвращает массив ключей
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    const sql = `INSERT INTO ${table}(${keys.join(', ')}) VALUES(${placeholders}) RETURNING *`;
    return this.query(sql, values);
  }
}

module.exports = {
    DbHandler,
    dbConnect
}
