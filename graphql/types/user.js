import {gql} from 'apollo-server-express';

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

               if (context.user?.isAdmin === false) throw new Error('FORBIDDEN');
               
               return await models.User.findByPk(id, {include: models.Balance})
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
               return ({newUser, authorization: userAuthentication.generateAccessToken(newUser.id, newUser.email)});
         
             }
         
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