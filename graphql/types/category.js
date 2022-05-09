import {gql} from 'apollo-server-express';

import models from '../../models';



export default class Category {
   static resolver() {
      return {

         Query: {
            getCategories: async () => await models.Category.findAll(),
         },

         Mutation: {         
         }
      }
   }

   static typeDefs() {
      return gql`
      
         type Category {
            id: Int
            name: String
            parentId: Int
            createdAt: String
            updatedAt: String
         }
     
          
      `
   }
}