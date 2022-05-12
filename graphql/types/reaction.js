import {gql} from 'apollo-server-express';

import models from '../../models';
import {THROW_ERROR_MESSAGES, REACTIONS_TO_COMMENT} from '../../config/const.js';



export default class Reaction {
   static resolver() {
      return {

         Query: {


         },

         Mutation: {
            
            addReaction: async (parent, {commentId, userId, reaction}, context) => {

               if (context.user?.id !== userId) throw new Error(THROW_ERROR_MESSAGES.FORBIDDEN);

               if (reaction !== REACTIONS_TO_COMMENT.LIKE 
                  && reaction !== REACTIONS_TO_COMMENT.DISLIKE
                  && reaction !== null) {

                  throw new Error('Wrong reaction');
               }

               const reactionTable = await models.Reaction.findOne({where: {commentId, userId}});

               let newReactionTable;

               if (!reactionTable) {
                  newReactionTable = await models.Reaction.create({commentId, userId, reaction});
               } else {

                  if (reaction === null) {
                     reactionTable.destroy();
                  }  else {
                     reactionTable.update({reaction});
                  }

               }

               return (newReactionTable || reactionTable);

            }

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