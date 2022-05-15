import {gql} from 'apollo-server-express';
import { sequelize } from '../../models/index.js';

import models from '../../models';
import * as entryDataValidation from '../../utils/entryDataValidation.js';
import * as passwordHashing from '../../utils/passwordHashing.js';
import * as userAuthentication from '../../utils/userAuthentication.js'
import {USER_STATUSES, USER_ROLES, COMMENT_TYPES}  from '../../config/const.js';
import {THROW_ERROR_MESSAGES} from '../../config/const.js';
import * as checkUserRights from '../../utils/checkUserRights.js'



export default class User {
   static resolver() {
      return {

         User: {
            balance: user => user.getBalance(),
            order: user => user.getOrders(),
         },

         Query: {

            getUsers: async (parent, args, context) => {
               
               checkUserRights.checkRole(context, USER_ROLES.ADMIN)

               return models.User.findAll();

            },

            getUser: async (parent, { id }, context) => {

               checkUserRights.checkRole(context, id);
               
               return models.User.findByPk(id);
            },

            authorizeUser: async (parent, { email, password }) => {

               if (!entryDataValidation.validateEmail(email)) throw new Error('Incorrect password');
               if (!entryDataValidation.validatePassword(password)) throw new Error('Incorrect password');

               const user = await models.User.findOne({where: {email, password}});
               if (!user) throw new Error(THROW_ERROR_MESSAGES.USER_NOT_FOUND);

               if (!(await passwordHashing.compare(password, user.passwordHash))) {
                  throw new Error(THROW_ERROR_MESSAGES.UNAUTHORIZED);
               }

               return ({authorization: userAuthentication.generateAccessToken(user.id, user.email)});

            },

            getUserStatistics: async (parent, {}, context) => {

               checkUserRights.checkRole(context, USER_ROLES.ADMIN);


               const mostExpensiveOrder = await models.Order.findOne({
                  subQuery: false,
                  where: {
                     paid: true,
                  },
                  include: {
                     model: models.OrderProduct,
                     attributes: [
                        [sequelize.fn('SUM', sequelize.col('purchasePrice')), 'totalPurchasePrice'],
                     ],   
                  },
                  order: [
                     [sequelize.fn('MAX', sequelize.col('OrderProducts.purchasePrice')), 'DESC'],
                  ],
                  group: 'id',
                  raw: true,
               });


               return {
                  numberOfCustomers: models.User.count({where: {role: USER_ROLES.CUSTOMER}}),
                  numberOfManagers: models.User.count({where: {role: USER_ROLES.MANAGER}}),
                  numberOfAdmins: models.User.count({where: {role: USER_ROLES.ADMIN}}),
                  activeUsers: models.User.count({where: {status: USER_STATUSES.ACTIVE}}),
                  bannedUsers: models.User.count({where: {status: USER_STATUSES.BANNED}}),
                  totalUsers: models.User.count(),
                  sumOfMoneyOfAllUsers: models.Balance.sum('account'),
                  sumOfMoneySpentByAllUsers: models.OrderProduct.sum('purchasePrice'),
                  mostExpensiveOrder: mostExpensiveOrder['OrderProducts.totalPurchasePrice'],
                  mostExpensivePurchasedProduct: models.OrderProduct.max('purchasePrice'),
                  maxDiscount: models.Balance.max('discount'),
                  sumOfReviewsLeftByUsers: models.Comment.count({where: {type: COMMENT_TYPES.REVIEW}}),
                  sumOfCommentsLeftByUsers: models.Comment.count({where: {type: COMMENT_TYPES.COMMENT}}),
               };

            }

         },

         Mutation: {
            signup: async (parent, {input}) => {

               const {email, password, fullName, phone} = input;
         
               if (!entryDataValidation.validateEmail(email)) {
                 throw new Error('Incorrect email');
               }
         
               if (!entryDataValidation.validatePassword(password)) {
                 throw new Error('Incorrect password');
         
               }
               
               const transaction = await sequelize.transaction();

               try {
                  const existingUser = await models.User.findOne({where: {email}});
                  if (existingUser) throw new Error(THROW_ERROR_MESSAGES.USER_ALREADY_EXISTS);

                  const newUser = await models.User.create({
                     email,
                     fullName,
                     phone,
                     status: USER_STATUSES.ACTIVE,
                     passwordHash: await passwordHashing.hash(password),
                  }, {transaction});

                  await newUser.createBalance({}, {transaction});

                  await transaction.commit();

                  return {authorization: userAuthentication.generateAccessToken(newUser.id, newUser.email)};

               } catch (error) {
                  console.log(error);
                  await transaction.rollback();
               }
         
            },

            replenishmentAccount: async (parent, {amountOfMoney}, context) => {

               checkUserRights.checkRole(context, USER_ROLES.ADMIN);

               if (amountOfMoney < 0) throw new Error('Incorrect amount of money');
               
               const user = await models.User.findByPk(context.user.id, {include: models.Balance});
               if (!user) throw new Error(THROW_ERROR_MESSAGES.USER_NOT_FOUND);

               const resultedBalance = parseFloat(user.Balance.account) + amountOfMoney;

               await user.Balance.update({account: resultedBalance});

               return user;
            },

            addProductToOrder: async (parent, {userId, productId, productQuantity}, context) => {

               checkUserRights.checkId(context, userId);


               if (!entryDataValidation.validatePositiveNumbers([userId, productId, productQuantity])) {
                  throw new Error('Incorrect data sent');
               }

               const transaction = await sequelize.transaction();

               try {
                  
                  const product = await models.Product.findByPk(productId);
                  if (!product) throw new Error(THROW_ERROR_MESSAGES.PRODUCT_NOT_FOUND);
                  
                  const user = await models.User.findByPk(userId, {
                     include: {
                        model: models.Order,
                        where: {paid: false},
                        required: false,
                        include: {
                           model: models.OrderProduct,
                           required: false,
                           where: {productId}
                        } 
                     }
                  });

                  if (!user) throw new Error(THROW_ERROR_MESSAGES.USER_NOT_FOUND);

                  if (!user.Orders.length) {
                     const order = await user.createOrder({}, {transaction});
                     await order.createOrderProduct({
                        productId,
                        quantity: productQuantity,
                     }, {transaction});

                  }  else {

                     if (user.Orders[0].OrderProducts[0]) {
                        await user.Orders[0].OrderProducts[0].update({
                           quantity: user.Orders[0].OrderProducts[0].quantity + productQuantity,
                        }, {transaction});

                     }  else {
                        await user.Orders[0].createOrderProduct({
                           quantity: productQuantity,
                           productId, 
                        }, {transaction});
                        
                     }
                  }
               
                  await transaction.commit();
                  return user;

               } catch (error) {
                  await transaction.rollback();
                  throw new Error(error.message);
               }

            },

            removeProductFromOrder: async (parent, {userId, productId, orderId}, context) => {

               checkUserRights.checkId(context, userId);

               if (!entryDataValidation.validatePositiveNumbers([userId, productId, orderId])) {
                  throw new Error('Incorrect data sent');
               }

               const product = await models.Product.findByPk(productId);
               if (!product) throw new Error(THROW_ERROR_MESSAGES.PRODUCT_NOT_FOUND);
            
               const user = await models.User.findByPk(userId, {
                  include: {
                     model: models.Order,
                     where: {id: orderId},
                     required: false,
                     include: {
                        model: models.OrderProduct, 
                        where: {productId}, 
                        required: false,
                     },
                  },
                  attributes: ['id', 'email', 'fullName', 'phone'],
               });
            
               if (!user) throw new Error(THROW_ERROR_MESSAGES.USER_NOT_FOUND);
               if (!user.Orders.length) throw new Error(THROW_ERROR_MESSAGES.ORDER_NOT_FOUND);
               if (!user.Orders[0].OrderProducts[0]) {
                  throw new Error('Product does not exist in order');
               }
            
               await user.Orders[0].OrderProducts[0].destroy();
            
               return user;
            
            },

            removeOrder: async (parent, {userId, orderId}, context) => {

               checkUserRights.checkId(context, userId);

               if (!entryDataValidation.validatePositiveNumbers([userId, orderId])) {
                  throw new Error('Incorrect data sent');
               }

               const order = await models.Order.findOne({where: {id: orderId, userId, paid: false}});
               if (!order) throw new Error(THROW_ERROR_MESSAGES.ORDER_NOT_FOUND);

               await order.destroy();

               return context.user;

            },

            completeOrder: async (parent, {userId, orderId}, context) => {

               checkUserRights.checkId(context, userId);

               const transaction = await sequelize.transaction();

               try {

                  const user = await models.User.findByPk(userId, {
                     include: {
                        model: models.Order,
                        where: {id: orderId, paid: false},
                        required: false,
                        include: {
                           model: models.OrderProduct,
                           required: false,
                        },
                     }
                  });

                  if (!user) throw new Error(THROW_ERROR_MESSAGES.USER_NOT_FOUND);

                  if (!user.Orders.length) throw new Error(THROW_ERROR_MESSAGES.ORDER_NOT_FOUND);

                  if (!user.Orders[0].OrderProducts.length) throw new Error('No products in order');

                  let purchasePrice = 0;

                  for (let i = 0; i < user.Orders[0].OrderProducts.length; i++) {

                     const product = await user.Orders[0].OrderProducts[i].getProduct();

                     if (!product) {
                        throw new Error(`Product ID ${user.Orders[0].OrderProducts[i].productId} does not exist`);
                     }

                     const orderProductPrice = product.price * user.Orders[0].OrderProducts[i].quantity;
                     purchasePrice += orderProductPrice;
                     
                     user.Orders[0].OrderProducts[i].update({purchasePrice: orderProductPrice});

                  }

                  const balance = await user.getBalance();

                  if (balance.discount){

                     const discount = balance.discount * 0.01 * purchasePrice;
                     purchasePrice -= discount;
                     
                  }

                  const resultedAccount = balance.account - purchasePrice;

                  if (resultedAccount < 0) throw new Error(THROW_ERROR_MESSAGES.PAYMENT_PROHIBITED);

                  await balance.update({account: resultedAccount}, {transaction});
                  await user.Orders[0].update({paid: true, orderPrice: purchasePrice}, {transaction});

                  await transaction.commit();
                  return user;
               

               } catch (error) {
                  throw new Error(error.message);
               }


            },

         
         }
      }
   }

   static typeDefs() {
      return gql`

         type User {
            id: Int
            email: String
            fullName: String
            phone: String
            status: Status
            createdAt: String
            balance: Balance
            order: [Order]
         }

         enum Status {
            ACTIVE
            BANNED
         }
   
         input SignupInput {
            email: String!
            fullName: String!
            phone: String!
            password: String!
         }

         type UserStatistics {
            numberOfCustomers: Int
            numberOfManagers: Int
            numberOfAdmins: Int
            activeUsers: Int
            bannedUsers: Int
            totalUsers: Int
            sumOfMoneyOfAllUsers: Float
            sumOfMoneySpentByAllUsers: Float
            mostExpensiveOrder: Float
            mostExpensivePurchasedProduct: Float
            maxDiscount: Int
            sumOfReviewsLeftByUsers: Int
            sumOfCommentsLeftByUsers: Int
         }

         type LoginResponse {
            authorization: String!
            message: String
          }
        
      `
   }
}