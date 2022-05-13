import {gql} from 'apollo-server-express';

import models from '../../models';
import {THROW_ERROR_MESSAGES, REACTIONS_TO_COMMENT} from '../../config/const.js';



export default class Reaction {
   static resolver() {
      return {


         Mutation: {
            
            addReaction: async (parent, {input}, context) => {

               checkUserRights.checkId(context, input.userId);

               const reaction = await models.Reaction.findOne({
                  where: {
                     commentId: input.commentId, 
                     userId: input.userId
                  }
               });

               let newReaction;

               if (!reaction) {
                  newReaction = await models.Reaction.create({
                     commentId: input.commentId, 
                     userId: input.userId, 
                     reaction: input.reaction});
               } else {

                  if (input.reaction === null) {
                     reaction.destroy();
                  }  else {
                     reaction.update({reaction: input.reaction});
                  }

               }

               return (newReaction || reaction);

            }

         }
      }
   }

   static typeDefs() {
      return gql`
      
         type Reaction {
            commentId: Int
            userId: Int
            reaction: ReactionField
            createdAt: String
         }
         
         enum ReactionField {
            ${REACTIONS_TO_COMMENT.LIKE}
            ${REACTIONS_TO_COMMENT.DISLIKE}
         }

         input ReactionInput {
            commentId: Int
            userId: Int
            reaction: ReactionField
         }

      `
   }
}