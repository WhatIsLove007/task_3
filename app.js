import express from 'express';
import dotenv from 'dotenv/config';
import { ApolloServer } from 'apollo-server-express';

import {typeDefs, resolvers, context} from './graphql/schema.js';

const app = express();
const PORT = process.env.PORT || 3000;


async function startApolloServer() {

  const server = new ApolloServer({ typeDefs, resolvers, context });
  await server.start();
  server.applyMiddleware({app});
  
}
startApolloServer();


app.use(express.json());

app.post('/auth/register', (request, response) => {

})


  
app.listen(PORT, error => {
  error? console.log(error) : console.log(`Server has been started on PORT ${PORT}...`);
})
