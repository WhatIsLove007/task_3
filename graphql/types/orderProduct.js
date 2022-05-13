import {gql} from 'apollo-server-express';


export default class OrderProduct {
   static resolver() {
      return {

         OrderProduct: {
            product: orderProduct => orderProduct.getProduct(),
         },

      }
   }

   static typeDefs() {
      return gql`
      
         type OrderProduct {
            orderId: Int
            productId: Int
            quantity: Int
            purchasePrice: Float
            createdAt: String
            updatedAt: String
            product: Product
         }
     
          
      `
   }
}