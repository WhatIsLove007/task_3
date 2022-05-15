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
import { USER_STATUSES } from "../config/const.js";




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
    getUserStatistics: UserStatistics

    authorizeUser(id: Int!, password: String!): User

    getOrder(orderId: Int!): Order

    getCategories: [Category]
    
    getProducts(input: GetProductsInput): [Product]
    getProduct(id: Int): Product

    getComments(productId: Int!): [Comment]
    
  }


  type Mutation {
    signup(input: SignupInput): LoginResponse

    replenishmentAccount(amountOfMoney: Float!): User
    addProductToOrder(userId: Int!, productId: Int!, productQuantity: Int): User
    removeProductFromOrder(userId: Int!, productId: Int!, orderId: Int!): User
    removeOrder(userId: Int!, orderId: Int!): User
    completeOrder(userId: Int!, orderId: Int!): User

    addCategory(name: String!, parentId: Int): Category
    removeCategory(id: Int!): Category

    addProduct(input: AddProductInput!): Product
    removeProduct(id: Int!): Product

    addReview(input: ReviewInput): Comment
    addComment(input: CommentInput): Comment
    removeComment(id: Int!, userId: Int!): Comment

    addReaction(input: ReactionInput): Reaction

  }

`;


function combineResolvers() {
  return _.merge(
    User.resolver(),
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
  if (!user || user.status === USER_STATUSES.BANNED) {
    context.user = null;
    return context;
  }

  context.user = user;
  return context;
}