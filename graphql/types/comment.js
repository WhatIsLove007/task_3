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

            addReview: async (parent, { input }, context) => {

               const {userId, productId, assessment, comment, advantages, disadvantages} = input;

               checkUserRights.checkId(context, userId);

               const product = await models.Product.findOne({where: {id: productId}});
               if (!product) throw new Error(THROW_ERROR_MESSAGES.PRODUCT_NOT_FOUND);

               const review = await models.Comment.findOne({where: {userId, productId}});
               if (review) throw new Error(THROW_ERROR_MESSAGES.REVIEW_ALREADY_EXISTS);

               return models.Comment.create({
                  userId,
                  productId, 
                  assessment,
                  comment,
                  advantages, 
                  disadvantages,
                  type: COMMENT_TYPES.REVIEW,
               });


            },

            addComment: async (parent, { input }, context) => {

               const { userId, commentId, comment } = input;

               checkUserRights.checkId(context, userId);

               const review = await models.Comment.findOne({where: {id: commentId}});
               if (!review) throw new Error(THROW_ERROR_MESSAGES.COMMENT_NOT_FOUND);

               return models.Comment.create({
                  userId, 
                  productId: review.productId,
                  commentId,
                  type: COMMENT_TYPES.COMMENT,
                  comment,
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
            assessment: Int
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

         input ReviewInput {
            userId: Int!
            productId: Int!
            assessment: Int!
            comment: String!
            advantages: String!
            disadvantages: String!
         }

         input CommentInput {
            userId: Int!
            productId: Int!
            commentId: Int!
            comment: String!
         }
          
      `
   }
}