import {gql} from 'apollo-server-express';

import models from '../../models';



export default class Comment {
   static resolver() {
      return {

         Query: {
            getComments: async (_, { productId }) => {
               return await models.Comment.findAll({
                 where: {productId},
                 include: {
                   model: models.Reaction,
                   required: false,
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
      
         type Comment {
            id: Int
            userId: Int
            productId: Int
            commentId: Int
            type: String
            assesment: Int
            comment: String
            advantages: String
            disadvantages: String
            createdAt: String
            Reactions: [Reaction]
         }
          
      `
   }
}