import {gql} from 'apollo-server-express';

import models from '../../models';
import {THROW_ERROR_MESSAGES} from '../../config/const.js';



export default class Order {
   static resolver() {
      return {

         Order: {
            orderProduct: order => order.getOrderProducts(),
         },

         Query: {
            getOrder: async (_, { id }, context) => {
               
               if (context.user?.id !== id) throw new Error(THROW_ERROR_MESSAGES.FORBIDDEN);

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
            orderProduct: [OrderProduct]
         }
     
          
      `
   }
}