import {gql} from 'apollo-server-express';

import models from '../../models';


export default class Order {
   static resolver() {
      return {

         Query: {
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
         },

         Mutation: {         
         }
      }
   }

   static typeDefs() {
      return gql`
      
         type Order {
            id: Int
            userId: Int
            paid: Boolean
            deliveryStatus: String
            createdAt: String
            OrderProducts: [OrderProduct]
         }
     
          
      `
   }
}