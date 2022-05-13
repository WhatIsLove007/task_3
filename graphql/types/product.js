import {gql} from 'apollo-server-express';

import models from '../../models';
import {USER_ROLES} from '../../config/const.js';
import * as userAuthentication from '../../utils/userAuthentication.js';
import {THROW_ERROR_MESSAGES} from '../../config/const.js';
import * as checkUserRights from '../../utils/checkUserRights.js';



export default class Product {
   static resolver() {
      return {

         Product: {
            category: product => product.getCategory(),
            comments: product => product.getComments(),
         },

         Query: {
            getProducts: async () => models.Product.findAll(),

            getProduct: async (parent, { id }) => models.Product.findByPk(id),
            

         },

         Mutation: {

            addProduct: async (parent, {input}, context) => {

               checkUserRights.checkRole(context, USER_ROLES.ADMIN);

               const {name, description, categoryId, price} = input;

            
               const existingProduct = await models.Product.findOne({where: {name}});
               if (existingProduct) throw new Error(THROW_ERROR_MESSAGES.PRODUCT_ALREADY_EXISTS);
            
               const category = await models.Category.findByPk(categoryId);
               if (!category) throw new Error(THROW_ERROR_MESSAGES.CATEGORY_NOT_FOUND);
            
               return category.createProduct({name, description, price});
            

            },
            
            removeProduct: async (parent, { id }, context) => {

               checkUserRights.checkRole(context, USER_ROLES.ADMIN);

               const existingProduct = await models.Product.destroy({where: {id}});
               if (!existingProduct) throw new Error(THROW_ERROR_MESSAGES.PRODUCT_NOT_FOUND);
                  
               return existingProduct;
                  
            
            }      
            
         }
      }
   }

   static typeDefs() {
      return gql`
      
         type Product {
            id: Int
            categoryId: Int
            name: String
            description: String
            price: Float
            createdAt: String
            updatedAt: String
            category: Category
            comments: [Comment]
         }

         input AddProductInput {
            name: String!
            description: String!
            categoryId: Int!
            price: Float!
         }
     
          
      `
   }
}