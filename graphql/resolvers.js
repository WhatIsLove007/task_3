import models from '../models';
import * as entryDataValidation from '../utils/entryDataValidation.js';
import * as passwordHashing from '../utils/passwordHashing.js';
import {USER_STATUSES}  from '../config/const.js';
import * as userAuthentication from '../utils/userAuthentication.js'


export const resolvers = {
  Query: {
    getUsers: async () => await models.User.findAll({include: models.Balance}),
    getUser: async (_, { id }) => await models.User.findByPk(id, {include: models.Balance}),

    getOrder: async (_, { id }) => {
      return await models.Order.findByPk(id, {
        include: {
          model: models.OrderProduct, 
          required: false,
          include: {
            model: models.Product,
            required: false,
            include: {
              model: models.Category,
              required: false,
            }
          }
        }
      });
    },

    getCategories: async () => await models.Category.findAll(),

    getProducts: async () => await models.Product.findAll({include: models.Category}),
    getProduct: async (_, { id }) => await models.Product.findByPk(id, {include: models.Category}),

    getComments: async (_, { productId }) => {
      return await models.Comment.findAll({
        where: {productId},
        include: {
          model: models.Reaction,
          required: false,
        }
      });
    },

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

      return ({newUser, token: userAuthentication.generateAccessToken(newUser.id)});

    }
  }

};