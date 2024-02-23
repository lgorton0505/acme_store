const pg = require('pg');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_store_db');


const createTables = async()=> {
  const SQL = `
    DROP TABLE IF EXISTS favorite;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS product;
    CREATE TABLE users(
      id UUID PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255)
    );
    CREATE TABLE product(
      id UUID PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL
    );
    CREATE TABLE favorite(
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) NOT NULL,
      product_id UUID REFERENCES product(id) NOT NULL,
      CONSTRAINT unique_product_user UNIQUE (user_id, product_id)
    );
  `;
  await client.query(SQL);
};

const createUser = async({ username, password })=> {
    const SQL = `
       INSERT INTO users(id, username, password) VALUES ($1, $2, $3) RETURNING *
       `;
    const response = await client.query(SQL, [uuid.v4(), username, await bcrypt.hash(password, 5)]);
    return response.rows[0];
}

const createProduct = async({ name })=> {
    const SQL = `
         INSERT INTO product(id, name) VALUES ($1, $2) RETURNING *
       `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];

}

const createUserFavorite = async({ user_id, product_id })=> {
    const SQL = `
       INSERT INTO favorite (id, user_id, product_id) VALUES ($1, $2, $3) RETURNING *
    `;
    const response = await client.query(SQL, [uuid.v4(), user_id, product_id]);
    return response.rows[0];
}

const fetchUsers = async()=> {
    return (await client.query('SELECT * FROM users')).rows;
}

const fetchProducts = async()=> {
    return (await client.query('SELECT * FROM product')).rows;
}

const fetchFavorites = async(id)=> {
    const SQL = `
       SELECT * FROM favorite
       WHERE user_id = $1
    `;
    const response = await client.query(SQL, [id]);
    return response.rows;
}

const destroyFavorite = async({user_id, id})=>{
    const SQL = `
       DELETE FROM favorite
       WHERE user_id = $1 AND id = $2
    `;
    await client.query(SQL, [user_id, id]);
}



module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  createUserFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  destroyFavorite
};
