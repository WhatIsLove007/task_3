import {gql} from 'apollo-server-express';


export default class Reaction {
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
      
         type Reaction {
            commentId: Int
            userId: Int
            reaction: String
            createdAt: String
         }
          
      `
   }
}