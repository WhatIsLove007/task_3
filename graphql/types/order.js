import {gql} from 'apollo-server-express';

import models from '../../models';
import {THROW_ERROR_MESSAGES} from '../../config/const.js';
import * as checkUserRights from '../../utils/checkUserRights.js';



export default class Order {
   static resolver() {
      return {

         Order: {
            orderProduct: order => order.getOrderProducts(),
         },

         Query: {
            getOrder: async (_, { orderId }, context) => {
               
               const order = await models.Order.findByPk(orderId);

               if (!order) throw new Error(THROW_ERROR_MESSAGES.ORDER_NOT_FOUND);

               checkUserRights.checkId(context, order.userId);

               return order;

            },         
         },

      }
   }

   static typeDefs() {
      return gql`
      
         type Order {
            id: Int
            userId: Int
            paid: Boolean
            deliveryStatus: DeliveryStatus
            createdAt: String
            orderProduct: [OrderProduct]
         }

         enum DeliveryStatus {
            IN_TRANSIT
            DEKIVERED
            RECEIVED
         }
     
          
      `
   }
}