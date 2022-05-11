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

            addComment: async (parent, { userId, productId, commentId, 
               comment, advantages, disadvantages }, context) => {


               if (context.user?.id !== userId) throw new Error('FORBIDDEN');

               // Here must be a code...
               return models.Comment.create({
                  userId, 
                  productId, 
                  commentId, 
                  comment, 
                  advantages, 
                  disadvantages,
               });

            },

            removeComment: async (parent, {id, userId}, context) => {
               // Here must be a code...
               
            }
    
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