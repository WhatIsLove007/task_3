import {gql} from 'apollo-server-express';

import models from '../../models';
import * as entryDataValidation from '../../utils/entryDataValidation.js';
import { USER_ROLES } from '../../config/const.js';
import {THROW_ERROR_MESSAGES} from '../../config/const.js';
import * as checkUserRights from '../../utils/checkUserRights.js';



export default class Category {
   static resolver() {
      return {

         Category: {
            product: category => category.getProducts(),
         },

         Query: {
            getCategories: async () => models.Category.findAll(),

         },

         Mutation: {
            
            addCategory: async (parent, {name, parentId}, context) => {

               checkUserRights.checkRole(context, USER_ROLES.ADMIN);



               const existingCategory = await models.Category.findOne({where: {name}});
               if (existingCategory) throw new Error(THROW_ERROR_MESSAGES.CATEGORY_ALREADY_EXISTS);

               if (parentId) {
                  const parentCategory = await models.Category.findOne({where: {id: parentId}});
                  if (!parentCategory) throw new Error('Parent category not found');
               }
                  
               return models.Category.create({ name, ...(parentId && {parentId}) });
                  
            },

            removeCategory: async (parent, { id }, context) => {

               checkUserRights.checkRole(context, USER_ROLES.ADMIN);

               const category = await models.Category.findByPk(id);
               if (!category) throw new Error(THROW_ERROR_MESSAGES.CATEGORY_NOT_FOUND);

               return category.destroy();
                  
            }

         }
      }
   }

   static typeDefs() {
      return gql`
      
         type Category {
            id: Int
            name: String
            parentId: Int
            createdAt: String
            updatedAt: String
            product: [Product]
         }
     
          
      `
   }
}