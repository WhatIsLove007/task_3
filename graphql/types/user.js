import {gql} from 'apollo-server-express';
import { sequelize } from '../../models/index.js';

import models from '../../models';
import * as entryDataValidation from '../../utils/entryDataValidation.js';
import * as passwordHashing from '../../utils/passwordHashing.js';
import * as userAuthentication from '../../utils/userAuthentication.js'
import {USER_STATUSES}  from '../../config/const.js';


export default class User {
   static resolver() {
      return {

         Query: {

            getUsers: async (parent, args, context) => {
               
               if (!context.user) throw new Error('FORBIDDEN');

               return await models.User.findAll({include: models.Balance});

            },

            getUser: async (parent, { id }, context) => {

               if (context.user?.role !== 'CUSTOMER') throw new Error('FORBIDDEN');
               
               return await models.User.findByPk(id, {include: models.Balance})
            },

            authorizeUser: async (parent, { id, password }) => {

               if (!id) throw new Error('Incorrect id');
               if (!entryDataValidation.validatePassword(password)) throw new Error('Incorrect password');

               const user = await models.User.findByPk(id);
               if (!user) throw new Error('User not found');

               if (!(await passwordHashing.compare(password, user.passwordHash))) {
                  throw new Error('FORBIDDEN');
               }

               return ({user, authorization: userAuthentication.generateAccessToken(user.id, user.email)});

            }
         },

         Mutation: {
            createUser: async (parent, args) => {

               const {email, password, fullName, phone} = args;
         
               if (!entryDataValidation.validateEmail(email)) {
                 throw new Error('Incorrect email');
               }
         
               if (!entryDataValidation.validatePassword(password)) {
                 throw new Error('Incorrect password');
         
               }
         
               const user = await models.User.findOne({where: {email}});
               if (user) throw new Error('User already exists');
         
               const newUser = await models.User.create({
                 email,
                 passwordHash: await passwordHashing.hash(password),
                 fullName,
                 phone,
                 status: USER_STATUSES.ACTIVE,
               });
               return ({newUser, authorization: userAuthentication.generateAccessToken(newUser.id, newUser.email)});
         
            },

            replenishmentAccount: async (parent, { userId, amountOfMoney }, context) => {

               if (context.user?.id !== userId) throw new Error('FORBIDDEN');

               if (amountOfMoney < 0) throw new Error('Incorrect amount of money');
               
               const user = await models.User.findByPk(userId, {include: models.Balance});
               if (!user) throw new Error('User not found');

               const resultedBalance = parseFloat(user.Balance.account) + amountOfMoney;

               await user.Balance.update({account: resultedBalance});

               return user;
            },

            addProductToOrder: async (parent, {userId, productId, productQuantity}, context) => {

               if (context.user?.id !== userId) throw new Error('FORBIDDEN');

               if (!entryDataValidation.validatePositiveNumbers([userId, productId, productQuantity])) {
                  throw new Error('Incorrect data sent');
               }

               const transaction = await sequelize.transaction();

               try {
                  
                  const product = await models.Product.findByPk(productId);
                  if (!product) throw new Error('Product does not exist');
                  
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

                  if (!user) throw new Error('User does not exist');

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
                        });

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

               if (context.user?.id !== userId) throw new Error('FORBIDDEN');

               if (!entryDataValidation.validatePositiveNumbers([userId, productId, orderId])) {
                  throw new Error('Incorrect data sent');
               }

               try {
            
                  const product = await models.Product.findByPk(productId);
                  if (!product) throw new Error('Product does not exist');
            
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
            
                  if (!user) throw new Error('User does not exist');
                  if (!user.Orders.length) throw new Error('Order does not exist');
                  if (!user.Orders[0].OrderProducts[0]) {
                     throw new Error('Product does not exist in order');
                  }
            
                  await user.Orders[0].OrderProducts[0].destroy();
            
                  return user;
            
               } catch (error) {
                  throw new Error(error.message);
               }
            
            },

            removeOrder: async (parent, {userId, orderId}, context) => {

               if (context.user?.id !== userId) throw new Error('FORBIDDEN');

               if (!entryDataValidation.validatePositiveNumbers([userId, orderId])) {
                  throw new Error('Incorrect data sent');
               }

 
               try {

                  const order = await models.Order.findOne({where: {id: orderId, userId, paid: false}});
                  if (!order) throw new Error('Order does not exist');

                  await order.destroy();

                  return context.user;

               } catch (error) {
                  throw new Error(error.message);
               }
            },

            completeOrder: async (parent, {userId, orderId}, context) => {

               if (context.user?.id !== userId) throw new Error('FORBIDDEN');

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

                  if (!user) throw new Error('User not found');

                  if (!user.Orders.length) throw new Error('Order not found');

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

                  if (resultedAccount < 0) throw new Error('Payment prohibited');

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
            status: String
            createdAt: String
            Balance: Balance
         }
     
      `
   }
}