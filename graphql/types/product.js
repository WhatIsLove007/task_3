import {gql} from 'apollo-server-express';

import models from '../../models';



export default class Product {
   static resolver() {
      return {

         Query: {
            getProducts: async () => await models.Product.findAll({include: models.Category}),
            getProduct: async (_, { id }) => await models.Product.findByPk(id, {include: models.Category}),        
         },

         Mutation: {         
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