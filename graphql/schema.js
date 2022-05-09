import {_} from 'lodash';
import { gql } from 'apollo-server-express';

import User from './types/user.js';
import Balance from './types/balance.js';
import Order from './types/order.js';
import OrderProduct from './types/orderProduct.js';
import Product from './types/product.js';
import Category from './types/category.js';
import Comment from './types/comment.js';
import Reaction from './types/reaction.js';
import * as userAuthentication from '../utils/userAuthentication.js';




export const typeDefs = gql`

  ${User.typeDefs()}

  ${Balance.typeDefs()}
  
  ${Order.typeDefs()}

  ${OrderProduct.typeDefs()}

  ${Product.typeDefs()}

  ${Category.typeDefs()}

  ${Comment.typeDefs()}

  ${Reaction.typeDefs()}


  type Query {
    getUsers: [User]
    getUser(id: Int): User

    getOrder(id: Int): Order

    getCategories: [Category]

    getProducts: [Product]
    getProduct(id: Int): Product

    getComments(productId: Int): [Comment]
  }


  type Mutation {
    createUser(email: String!, fullName: String!, phone: String!, password: String!): User!
  }

`;


function combineResolvers() {
  return _.merge(
    User.resolver(),
    Balance.resolver(),
    Order.resolver(),
    OrderProduct.resolver(),
    Product.resolver(),
    Category.resolver(),
    Comment.resolver(),
    Reaction.resolver(),
  )
}

export const resolvers = combineResolvers();


export const context = async context => {

  const authorization = context.req.headers.authorization;
  if (!authorization) {
    context.user = null;
    return context;
  }

  const user = await userAuthentication.authenticateToken(authorization);
  if (!user) {
    context.user = null;
    return context;
  }

  context.user = user;
  return context;
}