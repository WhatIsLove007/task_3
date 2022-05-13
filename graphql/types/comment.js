import {gql} from 'apollo-server-express';

import models from '../../models';
import {THROW_ERROR_MESSAGES, COMMENT_TYPES} from '../../config/const.js';
import * as checkUserRights from '../../utils/checkUserRights.js';


export default class Comment {
   static resolver() {
      return {

         Comment: {
            reactions: comment => comment.getReactions(),
         },


         Mutation: {

            addComment: async (parent, { input }, context) => {

               checkUserRights.checkId(context, input.userId);


               if (input.commentId) {
                  const repliedComment = await models.Comment.findOne({where: {id: input.commentId, commentId: null}});
                  if (!repliedComment) throw new Error('Incorrect commentId')
               }

               
               return models.Comment.create({
                  userId: input.userId, 
                  productId: input.productId, 
                  type: input.type,
                  comment: input.comment,
                  ...(input.type === COMMENT_TYPES.REVIEW? {assessment: input.assessment, 
                     advantages: input.advantages, 
                     disadvantages: input.disadvantages} : {commentId: input.commentId}),
               });


            },

            removeComment: async (parent, {id, userId}, context) => {
               
               checkUserRights.checkId(context, userId);

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

         input CommentInput {
            userId: Int!
            productId: Int!
            commentId: Int
            type: Type!
            assessment: Int
            comment: String!
            advantages: String
            disadvantages: String
         }
          
      `
   }
}