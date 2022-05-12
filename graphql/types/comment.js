import {gql} from 'apollo-server-express';

import models from '../../models';
import {THROW_ERROR_MESSAGES, COMMENT_TYPES} from '../../config/const.js';


export default class Comment {
   static resolver() {
      return {

         Comment: {
            reactions: comment => comment.getReactions(),
         },

         Query: {

            getComments: async (_, { productId }) => await models.Comment.findAll({where: {productId}}),
                        
         },

         Mutation: {

            addComment: async (parent, { userId, productId, commentId, type, assessment,
               comment, advantages, disadvantages }, context) => {

               if (context.user?.id !== userId) throw new Error(THROW_ERROR_MESSAGES.FORBIDDEN);


               if (commentId) {
                  const repliedComment = await models.Comment.findOne({where: {id: commentId, commentId: null}});
                  if (!repliedComment) throw new Error('Incorrect commentId')
               }

               
               return models.Comment.create({
                  userId, 
                  productId, 
                  type,
                  comment,
                  ...(type === COMMENT_TYPES.REVIEW? {assessment, advantages, disadvantages} : {commentId}),
               });


            },

            removeComment: async (parent, {id, userId}, context) => {
               
               if (context.user?.id !== userId) throw new Error(THROW_ERROR_MESSAGES.FORBIDDEN);

               const comment = await models.Comment.findOne({where: {id, userId}});

               if (!comment) throw new Error(THROW_ERROR_MESSAGES.COMMENT_NOT_FOUND);

               return comment.destroy();
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
            type: Type
            assesment: Int
            comment: String
            advantages: String
            disadvantages: String
            createdAt: String
            reactions: [Reaction]
         }

         enum Type {
            REVIEW
            COMMENT
         }
          
      `
   }
}