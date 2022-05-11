import {gql} from 'apollo-server-express';

import models from '../../models';


export default class Reaction {
   static resolver() {
      return {

         Query: {


         },

         Mutation: {
            
            addReaction: async (parent, {commentId, userId, reaction}, context) => {

               if (context.user?.id !== userId) throw new Error('FORBIDDEN');

               const reactionTable = await models.Reaction.findOne({where: {commentId, userId}});

               let newReactionTable;

               if (!reaction) {
                  newReactionTable = await models.Reaction.create({commentId, userId, reaction});
               } else {

                  if (reaction === null) {
                     reactionTable.destroy({});
                  }  else {
                     reactionTable.update({reaction});
                  }

               }

               return (newReactionTable && reactionTable);

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