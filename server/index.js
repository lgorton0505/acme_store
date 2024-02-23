const { 
    client, 
    createTables,
    createUser,
    createProduct,
    createUserFavorite,
    fetchUsers,
    fetchProducts,
    fetchFavorites,
    destroyFavorite
      } = require('./db');
const express = require('express');
const app = express();

app.get('/api/users', async(req, res, next)=> {
    try {
      res.send(await fetchUsers());
    }
    catch(ex){
      next(ex);
    }
  });
  
  app.get('/api/products', async(req, res, next)=> {
    try {
      res.send(await fetchProducts());
    }
    catch(ex){
      next(ex);
    }
  });


app.get('/api/users/:id/favorite', async(req, res, next)=> {
    try {
      res.send(await fetchFavorites(req.params.id));
    }
    catch(ex){
      next(ex);
    }
  });

const init = async()=> {
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('tables created');
    const [moe, tony, carl, foo, bar] = await Promise.all([
        createUser({ username: 'moe', password: 'MOE' }),
        createUser({ username: 'tony', password: 'LUCY'}),
        createUser({ username: 'carl', password: 'CARL'}),
        createProduct({ name: 'foo' }),
        createProduct({ name: 'bar' }),
    ]);
    const users = await fetchUsers();
    console.log('users', users);

    const products = await fetchProducts();
    console.log('products', products);

    const userFavorites = await Promise.all([
        createUserFavorite({ user_id: moe.id, product_id: foo.id }),
        createUserFavorite({ user_id: moe.id, product_id: bar.id }),
    ]);

    console.log(await 'userFavorites', await fetchFavorites(moe.id));
    await destroyFavorite({ user_id: moe.id, id: userFavorites[0].id });
    console.log(moe.id, userFavorites[0].id);
    console.log(await 'userFavorites', await fetchFavorites(moe.id));

    const port = process.env.PORT || 3000;
  app.listen(port, ()=> console.log(`listening on port ${port}`));

    console.log(`CURL localhost:3000/api/users/${moe.id}/favorite`);
};

init();
