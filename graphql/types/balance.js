import {gql} from 'apollo-server-express';


export default class Balance {
   static resolver() {
      return {

         Query: {
         },

         Mutation: {         
         }
      }
   }

   static typeDefs() {
      return gql`
      
         type Balance {
            userId: Int
            account: Float
            discount: Int
         }
          
      `
   }
}