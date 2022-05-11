import {gql} from 'apollo-server-express';

import models from '../../models';
import {USER_ROLES} from '../../config/const.js';
import * as userAuthentication from '../../utils/userAuthentication.js'


export default class Product {
   static resolver() {
      return {

         Query: {
            getProducts: async () => await models.Product.findAll({include: models.Category}),

            getProduct: async (parent, { id }) => await models.Product.findByPk(id, {include: models.Category}),
            

         },

         Mutation: {

            addProduct: async (parent, {name, description, categoryId, price}, context) => {

               if (context.user?.role !== USER_ROLES.ADMIN) throw new Error('FORBIDDEN');

               try {
            
                  const existingProduct = await models.Product.findOne({where: {name}});
                  if (existingProduct) throw new Error('Product already exists');
            
                  const category = await models.Category.findByPk(categoryId);
                  if (!category) throw new Error('Category does not exist');
            
                  const product = await category.createProduct({name, description, price});
            
                  return product;
                  
               } catch (error) {
                  throw new Error(error.message);
               }

            },
            
            removeProduct: async (parent, { id }, context) => {

               if (context.user?.role !== USER_ROLES.ADMIN) throw new Error('FORBIDDEN');

               try {
            
                  const existingProduct = await models.Product.destroy({where: {id}});
                  if (!existingProduct) throw new Error('Product does not exist');
                  
                  return existingProduct;
                  
               } catch (error) {
                  throw new Error(error.message);
               }
            
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
            price: Int
            createdAt: String
            updatedAt: String
            Category: Category
         }
     
          
      `
   }
}