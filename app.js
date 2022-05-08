import express from 'express';
import dotenv from 'dotenv/config';
import { ApolloServer } from 'apollo-server-express';

import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';

const app = express();
const PORT = process.env.PORT || 3000;


async function startApolloServer(typeDefs, resolvers) {
  const server = new ApolloServer({typeDefs, resolvers});
  await server.start();
  server.applyMiddleware({app});
  
}
startApolloServer(typeDefs, resolvers);


app.use(express.json());

app.post('/auth/register', (request, response) => {

})


  
app.listen(PORT, error => {
  error? console.log(error) : console.log(`Server has been started on PORT ${PORT}...`);
})
